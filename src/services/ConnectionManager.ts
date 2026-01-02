import * as vscode from 'vscode';
import * as mssql from 'mssql';
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

        const config: mssql.config = {
            server: connection.server,
            database: connection.database || 'master',
            user: connection.user,
            password: connection.password,
            port: connection.port || 1433,
            options: {
                encrypt: true, // Use this if you're on Azure.
                trustServerCertificate: true // Change to false for Azure
            }
        };

        const pool = new mssql.ConnectionPool(config);
        const connectedPool = await pool.connect();
        this.activePools.set(connectionId, connectedPool);
        return connectedPool;
    }

    public async getDatabases(connectionId: string): Promise<string[]> {
        const pool = await this.connect(connectionId);
        const result = await pool.request().query('SELECT name FROM sys.databases WHERE name NOT IN (\'master\', \'tempdb\', \'model\', \'msdb\')');
        return result.recordset.map(record => record.name);
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
