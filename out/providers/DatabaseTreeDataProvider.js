"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseItem = exports.DatabaseTreeDataProvider = void 0;
const vscode = require("vscode");
class DatabaseTreeDataProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
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
    refresh() {
        this._onDidChangeTreeData.fire();
    }
}
exports.DatabaseTreeDataProvider = DatabaseTreeDataProvider;
class DatabaseItem extends vscode.TreeItem {
    constructor(label, collapsibleState, contextValue) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.contextValue = contextValue;
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