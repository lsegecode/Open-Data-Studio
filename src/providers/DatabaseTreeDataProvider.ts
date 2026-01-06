import * as vscode from 'vscode';
import * as path from 'path';
import { ConnectionManager } from '../services/ConnectionManager';
import { MockDatabaseService } from '../services/MockDatabaseService';

export class DatabaseTreeDataProvider implements vscode.TreeDataProvider<DatabaseItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<DatabaseItem | undefined | null | void> = new vscode.EventEmitter<DatabaseItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<DatabaseItem | undefined | null | void> = this._onDidChangeTreeData.event;

    getTreeItem(element: DatabaseItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: DatabaseItem): Promise<DatabaseItem[]> {
        if (!element) {
            // Root: Return Servers (Connections) + Mock Server
            const connections = ConnectionManager.getInstance().getConnectionsMetadata();
            const items = connections.map(c => new DatabaseItem(c.label, vscode.TreeItemCollapsibleState.Collapsed, 'server', c.id));
            items.push(new DatabaseItem('Mock Server', vscode.TreeItemCollapsibleState.Collapsed, 'server', 'mock-server-id'));
            return items;
        }

        if (element.connectionId === 'mock-server-id') {
            if (element.contextValue === 'server') {
                return [new DatabaseItem('Mock Database', vscode.TreeItemCollapsibleState.Collapsed, 'database', 'mock-server-id')];
            }
            if (element.contextValue === 'database') {
                return [
                    new DatabaseItem('Tables', vscode.TreeItemCollapsibleState.Collapsed, 'folder', 'mock-server-id', element.label),
                    new DatabaseItem('Procedures', vscode.TreeItemCollapsibleState.Collapsed, 'folder', 'mock-server-id', element.label)
                ];
            }
            if (element.label === 'Tables') {
                const dbName = element.parentDatabaseName || 'Mock Database';
                return MockDatabaseService.getMockTables().map(t => new DatabaseItem(t, vscode.TreeItemCollapsibleState.None, 'table', 'mock-server-id', dbName));
            }
            if (element.label === 'Procedures') {
                return MockDatabaseService.getMockStoredProcedures().map(p => new DatabaseItem(p, vscode.TreeItemCollapsibleState.None, 'procedure', 'mock-server-id'));
            }
            return [];
        }

        if (element.contextValue === 'server') {
            // Children of Server: Databases
            try {
                const databases = await ConnectionManager.getInstance().getDatabases(element.connectionId!);
                return databases.map(db => new DatabaseItem(db, vscode.TreeItemCollapsibleState.Collapsed, 'database', element.connectionId));
            } catch (err: any) {
                vscode.window.showErrorMessage(`Error fetching databases: ${err.message || err}`);
                return [];
            }
        }

        if (element.contextValue === 'database') {
            // Children of Database: Folder grouping (Tables, Views, etc. - simplified for now)
            return Promise.resolve([
                new DatabaseItem('Tables', vscode.TreeItemCollapsibleState.Collapsed, 'folder', element.connectionId, element.label),
                new DatabaseItem('Procedures', vscode.TreeItemCollapsibleState.Collapsed, 'folder', element.connectionId, element.label)
            ]);
        }

        if (element.label === 'Tables') {
            const dbName = element.parentDatabaseName || 'Unknown';
            // Placeholder tables for real connections (would be fetched from database in real implementation)
            return Promise.resolve([
                new DatabaseItem('dbo.Users', vscode.TreeItemCollapsibleState.None, 'table', element.connectionId, dbName),
                new DatabaseItem('dbo.Products', vscode.TreeItemCollapsibleState.None, 'table', element.connectionId, dbName)
            ]);
        }

        return Promise.resolve([]);
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
}

export class DatabaseItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly contextValue: string,
        public readonly connectionId?: string,
        public readonly parentDatabaseName?: string // Added for Script as CREATE
    ) {
        super(label, collapsibleState);
        this.tooltip = `${this.label}`;

        // Icons
        if (contextValue === 'server') {
            this.iconPath = new vscode.ThemeIcon('server');
        } else if (contextValue === 'database') {
            this.iconPath = new vscode.ThemeIcon('database');
        } else if (contextValue === 'table') {
            this.iconPath = new vscode.ThemeIcon('table');
        } else if (contextValue === 'folder') {
            this.iconPath = new vscode.ThemeIcon('folder');
        } else if (contextValue === 'procedure') {
            this.iconPath = new vscode.ThemeIcon('symbol-method');
        }
    }
}
