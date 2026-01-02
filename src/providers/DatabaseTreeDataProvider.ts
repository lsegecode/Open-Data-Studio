import * as vscode from 'vscode';
import * as path from 'path';
import { ConnectionManager } from '../services/ConnectionManager';

export class DatabaseTreeDataProvider implements vscode.TreeDataProvider<DatabaseItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<DatabaseItem | undefined | null | void> = new vscode.EventEmitter<DatabaseItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<DatabaseItem | undefined | null | void> = this._onDidChangeTreeData.event;

    getTreeItem(element: DatabaseItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: DatabaseItem): Promise<DatabaseItem[]> {
        if (!element) {
            // Root: Return Servers (Connections)
            const connections = ConnectionManager.getInstance().getConnectionsMetadata();
            return connections.map(c => new DatabaseItem(c.label, vscode.TreeItemCollapsibleState.Collapsed, 'server', c.id));
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
                new DatabaseItem('Tables', vscode.TreeItemCollapsibleState.Collapsed, 'folder', element.connectionId),
                new DatabaseItem('Procedures', vscode.TreeItemCollapsibleState.Collapsed, 'folder', element.connectionId)
            ]);
        }

        if (element.label === 'Tables') {
            // Mock tables for now, as table fetching isn't in this task scope yet
            return Promise.resolve([
                new DatabaseItem('dbo.Users', vscode.TreeItemCollapsibleState.None, 'table', element.connectionId),
                new DatabaseItem('dbo.Products', vscode.TreeItemCollapsibleState.None, 'table', element.connectionId)
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
        public readonly connectionId?: string
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
        }
    }
}
