import * as vscode from 'vscode';
import * as mssql from 'mssql';
// We don't necessarily need to import msnodesqlv8 variable, but we need the require for webpack/bundling usually
// However, mssql simply requires it dynamically. 
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

            const config: any = {
                server: connection.server,
                database: database,
                driver: 'msnodesqlv8',
                options: {
                    trustedConnection: true,
                    encrypt: false,
                    trustServerCertificate: true,
                    enableArithAbort: true
                }
            };

            if (connection.port) {
                config.port = connection.port;
            }

            pool = new mssql.ConnectionPool(config);
        } else {
            // SQL Login
            const config: mssql.config = {
                server: connection.server,
                database: connection.database || 'master',
                user: connection.user,
                password: connection.password,
                options: {
                    encrypt: false,
                    trustServerCertificate: true
                }
            };

            if (connection.port) {
                config.port = connection.port;
            }

            pool = new mssql.ConnectionPool(config);
        }

        const connectedPool = await pool.connect();
        this.activePools.set(connectionId, connectedPool);
        return connectedPool;
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
