import * as vscode from 'vscode';

import { DatabaseTreeDataProvider } from './providers/DatabaseTreeDataProvider';
import { DatabaseDashboard } from './panels/DatabaseDashboard';
import { ConnectionManager } from './services/ConnectionManager';
import { ConnectionInfo } from './models/ConnectionInfo';

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
        DatabaseDashboard.createOrShow(context.extensionUri, dbName);
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

    context.subscriptions.push(disposable);
    context.subscriptions.push(openDashboardCommand);
    context.subscriptions.push(addConnectionCommand);
    context.subscriptions.push(deleteConnectionCommand);
}

// This method is called when your extension is deactivated
export function deactivate() { }
