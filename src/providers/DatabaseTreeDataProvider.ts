import * as vscode from 'vscode';
import * as path from 'path';

export class DatabaseTreeDataProvider implements vscode.TreeDataProvider<DatabaseItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<DatabaseItem | undefined | null | void> = new vscode.EventEmitter<DatabaseItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<DatabaseItem | undefined | null | void> = this._onDidChangeTreeData.event;

    getTreeItem(element: DatabaseItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: DatabaseItem): Thenable<DatabaseItem[]> {
        if (!element) {
            // Root: Return Servers
            return Promise.resolve([
                new DatabaseItem('localhost', vscode.TreeItemCollapsibleState.Collapsed, 'server')
            ]);
        }

        if (element.contextValue === 'server') {
            // Children of Server: Databases
            return Promise.resolve([
                new DatabaseItem('AdventureWorks2019', vscode.TreeItemCollapsibleState.Collapsed, 'database'),
                new DatabaseItem('Master', vscode.TreeItemCollapsibleState.Collapsed, 'database')
            ]);
        }

        if (element.contextValue === 'database') {
            // Children of Database: Folder grouping (Tables, Views, etc. - simplified for now)
            return Promise.resolve([
                new DatabaseItem('Tables', vscode.TreeItemCollapsibleState.Collapsed, 'folder'),
                new DatabaseItem('Procedures', vscode.TreeItemCollapsibleState.Collapsed, 'folder')
            ]);
        }

        if (element.label === 'Tables') {
            return Promise.resolve([
                new DatabaseItem('dbo.Users', vscode.TreeItemCollapsibleState.None, 'table'),
                new DatabaseItem('dbo.Products', vscode.TreeItemCollapsibleState.None, 'table')
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
        public readonly contextValue: string
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
