"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseItem = exports.DatabaseTreeDataProvider = void 0;
const vscode = require("vscode");
const ConnectionManager_1 = require("../services/ConnectionManager");
class DatabaseTreeDataProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    getTreeItem(element) {
        return element;
    }
    async getChildren(element) {
        if (!element) {
            // Root: Return Servers (Connections)
            const connections = ConnectionManager_1.ConnectionManager.getInstance().getConnectionsMetadata();
            return connections.map(c => new DatabaseItem(c.label, vscode.TreeItemCollapsibleState.Collapsed, 'server', c.id));
        }
        if (element.contextValue === 'server') {
            // Children of Server: Databases
            try {
                const databases = await ConnectionManager_1.ConnectionManager.getInstance().getDatabases(element.connectionId);
                return databases.map(db => new DatabaseItem(db, vscode.TreeItemCollapsibleState.Collapsed, 'database', element.connectionId));
            }
            catch (err) {
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
    refresh() {
        this._onDidChangeTreeData.fire();
    }
}
exports.DatabaseTreeDataProvider = DatabaseTreeDataProvider;
class DatabaseItem extends vscode.TreeItem {
    constructor(label, collapsibleState, contextValue, connectionId) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.contextValue = contextValue;
        this.connectionId = connectionId;
        this.tooltip = `${this.label}`;
        // Icons
        if (contextValue === 'server') {
            this.iconPath = new vscode.ThemeIcon('server');
        }
        else if (contextValue === 'database') {
            this.iconPath = new vscode.ThemeIcon('database');
        }
        else if (contextValue === 'table') {
            this.iconPath = new vscode.ThemeIcon('table');
        }
        else if (contextValue === 'folder') {
            this.iconPath = new vscode.ThemeIcon('folder');
        }
    }
}
exports.DatabaseItem = DatabaseItem;
//# sourceMappingURL=DatabaseTreeDataProvider.js.map