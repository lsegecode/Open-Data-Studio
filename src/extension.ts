import * as vscode from 'vscode';

import { DatabaseTreeDataProvider } from './providers/DatabaseTreeDataProvider';
import { DatabaseDashboard } from './panels/DatabaseDashboard';
import { ConnectionManager } from './services/ConnectionManager';
import { ConnectionInfo } from './models/ConnectionInfo';
import { MockDatabaseService } from './services/MockDatabaseService';
import { QueryManager } from './services/QueryManager';
import { QueryResultsPanel } from './panels/QueryResultsPanel';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    console.log('Congratulations, your extension "open-data-studio" is now active!');

    // Register the Tree Data Provider
    const databaseProvider = new DatabaseTreeDataProvider();
    vscode.window.registerTreeDataProvider('openDataExplorer', databaseProvider);

    // Initialize ConnectionManager
    ConnectionManager.getInstance(context);

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('open-data-studio.helloWorld', () => {
        vscode.window.showInformationMessage('Hello from Open Data Studio!');
    });

    let openDashboardCommand = vscode.commands.registerCommand('open-data-studio.openDashboard', (databaseItem) => {
        // databaseItem will be passed if clicked from tree, or undefined if run from palette
        const dbName = databaseItem ? databaseItem.label : 'Unknown Database';
        let tables: string[] = [];
        let procedures: string[] = [];

        if (databaseItem && databaseItem.connectionId === 'mock-server-id') {
            tables = MockDatabaseService.getMockTables();
            procedures = MockDatabaseService.getMockStoredProcedures();
        }

        DatabaseDashboard.createOrShow(context.extensionUri, dbName, tables, procedures);
    });

    let addConnectionCommand = vscode.commands.registerCommand('open-data-studio.addConnection', async () => {
        const server = await vscode.window.showInputBox({
            prompt: 'Enter SQL Server Host/IP',
            placeHolder: 'localhost or 192.168.1.10',
            ignoreFocusOut: true
        });
        if (!server) return;

        const authType = await vscode.window.showQuickPick(['SqlLogin', 'Integrated'], {
            placeHolder: 'Select Authentication Type',
            ignoreFocusOut: true
        });
        if (!authType) return;

        let user, password;
        if (authType === 'SqlLogin') {
            user = await vscode.window.showInputBox({
                prompt: 'Enter Username',
                ignoreFocusOut: true
            });
            if (!user) return;

            password = await vscode.window.showInputBox({
                prompt: 'Enter Password',
                password: true,
                ignoreFocusOut: true
            });
            if (!password) return;
        }

        const connection: ConnectionInfo = {
            id: Date.now().toString(),
            label: server,
            server: server,
            authenticationType: authType as 'SqlLogin' | 'Integrated',
            user,
            password
        };

        try {
            await ConnectionManager.getInstance().addConnection(connection);
            databaseProvider.refresh();
            vscode.window.showInformationMessage(`Connection to ${server} added!`);
        } catch (err: any) {
            vscode.window.showErrorMessage(`Failed to add connection: ${err.message || err}`);
        }
    });

    let deleteConnectionCommand = vscode.commands.registerCommand('open-data-studio.deleteConnection', async (element: any) => {
        if (!element || !element.connectionId) return;

        try {
            await ConnectionManager.getInstance().deleteConnection(element.connectionId);
            databaseProvider.refresh();
            vscode.window.showInformationMessage('Connection deleted.');
        } catch (err: any) {
            vscode.window.showErrorMessage(`Failed to delete connection: ${err.message || err}`);
        }
    });

    let newQueryCommand = vscode.commands.registerCommand('open-data-studio.newQuery', async (databaseItem) => {
        // databaseItem comes from the tree view context
        if (!databaseItem) {
            vscode.window.showErrorMessage('Please select a database from the tree view to create a new query.');
            return;
        }

        const connectionId = databaseItem.connectionId;
        const databaseName = databaseItem.label; // Label is the DB name for database items

        // Open a new untitled SQL document
        const document = await vscode.workspace.openTextDocument({
            language: 'sql',
            content: `-- Query for ${databaseName}\nSELECT * FROM `
        });

        // Register the document with our QueryManager so we know which DB connection to use
        QueryManager.getInstance().registerQueryDocument(document.uri, connectionId, databaseName);

        await vscode.window.showTextDocument(document);
    });

    let runQueryCommand = vscode.commands.registerCommand('open-data-studio.runQuery', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const connectionCtx = QueryManager.getInstance().getConnectionForDocument(editor.document.uri);
        if (!connectionCtx) {
            vscode.window.showErrorMessage('This document is not associated with any database connection. Please use "New Query" from the Database Explorer.');
            return;
        }

        const query = editor.document.getText();
        if (!query) {
            vscode.window.showInformationMessage('Query is empty.');
            return;
        }

        try {
            let results: any[] = [];
            if (connectionCtx.connectionId === 'mock-server-id') {
                results = await MockDatabaseService.executeMockQuery(query);
            } else {
                // TODO: Implement real connection execution
                vscode.window.showInformationMessage(`Running query on real connection ${connectionCtx.connectionId} is not yet implemented.`);
                return;
            }

            QueryResultsPanel.createOrShow(context.extensionUri, results);
        } catch (err: any) {
            vscode.window.showErrorMessage(`Query execution failed: ${err.message || err}`);
        }
    });

    let scriptTableAsCreateCommand = vscode.commands.registerCommand('open-data-studio.scriptTableAsCreate', async (tableItem) => {
        if (!tableItem || tableItem.contextValue !== 'table') {
            vscode.window.showErrorMessage('Please select a table from the Database Explorer.');
            return;
        }

        const tableName = tableItem.label;
        const connectionId = tableItem.connectionId;
        const databaseName = tableItem.parentDatabaseName || 'Unknown';

        try {
            let columns: any[];

            if (connectionId === 'mock-server-id') {
                // Use mock data
                columns = MockDatabaseService.getMockTableSchema(tableName);
            } else {
                // Use real connection
                columns = await ConnectionManager.getInstance().getTableSchema(connectionId, databaseName, tableName);
            }

            // Generate CREATE TABLE script
            const script = generateCreateTableScript(tableName, columns);

            // Open a new SQL document with the script
            const document = await vscode.workspace.openTextDocument({
                language: 'sql',
                content: script
            });

            await vscode.window.showTextDocument(document);
        } catch (err: any) {
            vscode.window.showErrorMessage(`Failed to generate CREATE TABLE script: ${err.message || err}`);
        }
    });

    context.subscriptions.push(disposable);
    context.subscriptions.push(openDashboardCommand);
    context.subscriptions.push(addConnectionCommand);
    context.subscriptions.push(deleteConnectionCommand);
    context.subscriptions.push(newQueryCommand);
    context.subscriptions.push(runQueryCommand);
    context.subscriptions.push(scriptTableAsCreateCommand);

}

// This method is called when your extension is deactivated
export function deactivate() { }

// Helper function to generate CREATE TABLE script from column schema
function generateCreateTableScript(tableName: string, columns: any[]): string {
    const lines: string[] = [];
    const primaryKeys: string[] = [];

    lines.push(`CREATE TABLE [${tableName}] (`);

    columns.forEach((col, index) => {
        let colDef = `    [${col.COLUMN_NAME}] ${getDataTypeString(col)}`;

        if (col.IS_NULLABLE === 'NO') {
            colDef += ' NOT NULL';
        } else {
            colDef += ' NULL';
        }

        if (col.COLUMN_DEFAULT) {
            colDef += ` DEFAULT ${col.COLUMN_DEFAULT}`;
        }

        // Add comma if not the last item or if there are primary keys
        if (index < columns.length - 1) {
            colDef += ',';
        }

        lines.push(colDef);

        if (col.IS_PRIMARY_KEY === 1) {
            primaryKeys.push(col.COLUMN_NAME);
        }
    });

    // Add primary key constraint if any
    if (primaryKeys.length > 0) {
        lines[lines.length - 1] += ','; // Add comma to last column
        lines.push(`    CONSTRAINT [PK_${tableName.replace('.', '_')}] PRIMARY KEY CLUSTERED (`);
        lines.push(`        ${primaryKeys.map(pk => `[${pk}]`).join(', ')}`);
        lines.push('    )');
    }

    lines.push(');');
    lines.push('GO');

    return `-- Script generated by Open Data Studio\n-- Table: ${tableName}\n\n${lines.join('\n')}`;
}

// Helper function to format data type with size/precision
function getDataTypeString(column: any): string {
    const dataType = column.DATA_TYPE.toUpperCase();

    switch (dataType) {
        case 'NVARCHAR':
        case 'VARCHAR':
        case 'CHAR':
        case 'NCHAR':
            if (column.CHARACTER_MAXIMUM_LENGTH === -1) {
                return `${dataType}(MAX)`;
            }
            return `${dataType}(${column.CHARACTER_MAXIMUM_LENGTH || 255})`;

        case 'DECIMAL':
        case 'NUMERIC':
            return `${dataType}(${column.NUMERIC_PRECISION || 18}, ${column.NUMERIC_SCALE || 0})`;

        case 'FLOAT':
            if (column.NUMERIC_PRECISION) {
                return `${dataType}(${column.NUMERIC_PRECISION})`;
            }
            return dataType;

        default:
            return dataType;
    }
}
