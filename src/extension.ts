import * as vscode from 'vscode';

import { DatabaseTreeDataProvider } from './providers/DatabaseTreeDataProvider';

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
        // The code you place here will be executed every time your command is executed
        vscode.window.showInformationMessage('Hello from Open Data Studio!');
    });

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
