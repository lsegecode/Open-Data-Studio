import * as vscode from 'vscode';

import { DatabaseTreeDataProvider } from './providers/DatabaseTreeDataProvider';
import { DatabaseDashboard } from './panels/DatabaseDashboard';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    console.log('Congratulations, your extension "open-data-studio" is now active!');

    // Register the Tree Data Provider
    const databaseProvider = new DatabaseTreeDataProvider();
    vscode.window.registerTreeDataProvider('openDataExplorer', databaseProvider);

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

    context.subscriptions.push(disposable);
    context.subscriptions.push(openDashboardCommand);
}

// This method is called when your extension is deactivated
export function deactivate() { }
