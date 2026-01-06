import * as vscode from 'vscode';
import * as mssql from 'mssql';
// Import msnodesqlv8 for Windows Authentication - this is a native ODBC driver
const msnodesqlv8 = require('msnodesqlv8');
import { ConnectionInfo } from '../models/ConnectionInfo';

export class ConnectionManager {
    private static instance: ConnectionManager;
    private context: vscode.ExtensionContext;
    private readonly CONNECTIONS_KEY = 'open-data-studio.connections';
    private activePools: Map<string, mssql.ConnectionPool> = new Map();

    private constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    public static getInstance(context?: vscode.ExtensionContext): ConnectionManager {
        if (!ConnectionManager.instance) {
            if (!context) {
                throw new Error("ConnectionManager not initialized with context");
            }
            ConnectionManager.instance = new ConnectionManager(context);
        }
        return ConnectionManager.instance;
    }

    public async addConnection(connection: ConnectionInfo): Promise<void> {
        const connections = this.getConnectionsMetadata();
        connections.push(connection);
        await this.context.globalState.update(this.CONNECTIONS_KEY, connections);

        if (connection.password) {
            await this.context.secrets.store(`password-${connection.id}`, connection.password);
        }
    }

    public getConnectionsMetadata(): ConnectionInfo[] {
        return this.context.globalState.get<ConnectionInfo[]>(this.CONNECTIONS_KEY, []);
    }

    public async getConnectionWithPassword(id: string): Promise<ConnectionInfo | undefined> {
        const connections = this.getConnectionsMetadata();
        const connection = connections.find(c => c.id === id);
        if (connection) {
            if (connection.authenticationType === 'SqlLogin') {
                const password = await this.context.secrets.get(`password-${connection.id}`);
                if (password) {
                    connection.password = password;
                }
            }
            return connection;
        }
        return undefined;
    }

    public async connect(connectionId: string): Promise<mssql.ConnectionPool> {
        if (this.activePools.has(connectionId)) {
            const pool = this.activePools.get(connectionId);
            if (pool && pool.connected) {
                return pool;
            }
        }

        const connection = await this.getConnectionWithPassword(connectionId);
        if (!connection) {
            throw new Error(`Connection with ID ${connectionId} not found.`);
        }

        let pool: mssql.ConnectionPool;

        if (connection.authenticationType === 'Integrated') {
            const database = connection.database || 'master';
            console.log(`[Open Data Studio] DEBUG: Connecting (Integrated) to: ${connection.server}`);

            // Build proper ODBC connection string for Windows Authentication
            // This works with both default instances (localhost) and named instances (localhost\SQLEXPRESS)
            let serverPart = connection.server;
            if (connection.port) {
                serverPart = `${connection.server},${connection.port}`;
            }

            const connectionString = `Driver={ODBC Driver 17 for SQL Server};Server=${serverPart};Database=${database};Trusted_Connection=Yes;TrustServerCertificate=Yes;`;

            console.log(`[Open Data Studio] DEBUG: Using connection string (Integrated): Server=${serverPart}, Database=${database}`);

            // Use msnodesqlv8 with connection string
            const config: any = {
                connectionString: connectionString,
                driver: 'msnodesqlv8',
                options: {
                    trustedConnection: true,
                    enableArithAbort: true
                },
                connectionTimeout: 15000, // 15 second timeout for faster failure detection
                requestTimeout: 30000
            };

            pool = new mssql.ConnectionPool(config);
        } else {
            // SQL Login - use standard mssql config
            const config: mssql.config = {
                server: connection.server,
                database: connection.database || 'master',
                user: connection.user,
                password: connection.password,
                options: {
                    encrypt: false,
                    trustServerCertificate: true,
                    enableArithAbort: true
                },
                connectionTimeout: 15000,
                requestTimeout: 30000
            };

            if (connection.port) {
                config.port = connection.port;
            }

            console.log(`[Open Data Studio] DEBUG: Using SQL Login for server: ${connection.server}`);
            pool = new mssql.ConnectionPool(config);
        }

        try {
            const connectedPool = await pool.connect();
            this.activePools.set(connectionId, connectedPool);
            console.log(`[Open Data Studio] Successfully connected to ${connection.server}`);
            return connectedPool;
        } catch (error: any) {
            console.error(`[Open Data Studio] Connection failed: ${error.message}`);
            // Provide helpful error messages for common issues
            if (error.message.includes('ODBC Driver')) {
                throw new Error(`Connection failed: ODBC Driver 17 for SQL Server not found. Please install it from Microsoft's website.`);
            }
            if (error.message.includes('TCP/IP') || error.message.includes('connection refused')) {
                throw new Error(`Connection failed: Cannot connect to ${connection.server}. Ensure SQL Server is running, TCP/IP is enabled in SQL Server Configuration Manager, and the SQL Server Browser service is running (for named instances).`);
            }
            throw error;
        }
    }

    public async getTableSchema(connectionId: string, databaseName: string, tableName: string): Promise<any[]> {
        const pool = await this.connect(connectionId);

        // Parse schema and table name (format: "schema.tableName" like "dbo.Users")
        let schema = 'dbo';
        let table = tableName;
        if (tableName.includes('.')) {
            const parts = tableName.split('.');
            schema = parts[0];
            table = parts[1];
        }

        // Query INFORMATION_SCHEMA for column definitions
        const query = `
            USE [${databaseName}];
            SELECT 
                c.COLUMN_NAME,
                c.DATA_TYPE,
                c.CHARACTER_MAXIMUM_LENGTH,
                c.NUMERIC_PRECISION,
                c.NUMERIC_SCALE,
                c.IS_NULLABLE,
                c.COLUMN_DEFAULT,
                CASE WHEN pk.COLUMN_NAME IS NOT NULL THEN 1 ELSE 0 END as IS_PRIMARY_KEY
            FROM INFORMATION_SCHEMA.COLUMNS c
            LEFT JOIN (
                SELECT ku.TABLE_CATALOG, ku.TABLE_SCHEMA, ku.TABLE_NAME, ku.COLUMN_NAME
                FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
                JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE ku
                    ON tc.CONSTRAINT_TYPE = 'PRIMARY KEY' 
                    AND tc.CONSTRAINT_NAME = ku.CONSTRAINT_NAME
            ) pk ON c.TABLE_CATALOG = pk.TABLE_CATALOG 
                AND c.TABLE_SCHEMA = pk.TABLE_SCHEMA 
                AND c.TABLE_NAME = pk.TABLE_NAME 
                AND c.COLUMN_NAME = pk.COLUMN_NAME
            WHERE c.TABLE_SCHEMA = '${schema}' AND c.TABLE_NAME = '${table}'
            ORDER BY c.ORDINAL_POSITION
        `;

        const result = await pool.request().query(query);
        return result.recordset;
    }

    public async getDatabases(connectionId: string): Promise<string[]> {
        try {
            const pool = await this.connect(connectionId);
            const result = await pool.request().query('SELECT name FROM sys.databases WHERE name NOT IN (\'master\', \'tempdb\', \'model\', \'msdb\')');
            return result.recordset.map(record => record.name);
        } catch (error: any) {
            vscode.window.showErrorMessage(`Error fetching databases: ${error.message}. Ensure TCP/IP is enabled in SQL Server Configuration Manager.`);
            throw error;
        }
    }

    public async deleteConnection(connectionId: string): Promise<void> {
        let connections = this.getConnectionsMetadata();
        connections = connections.filter(c => c.id !== connectionId);
        await this.context.globalState.update(this.CONNECTIONS_KEY, connections);
        await this.context.secrets.delete(`password-${connectionId}`);

        if (this.activePools.has(connectionId)) {
            const pool = this.activePools.get(connectionId);
            if (pool) {
                await pool.close();
            }
            this.activePools.delete(connectionId);
        }
    }
}
