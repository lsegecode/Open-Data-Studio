"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const DatabaseTreeDataProvider_1 = require("./providers/DatabaseTreeDataProvider");
const DatabaseDashboard_1 = require("./panels/DatabaseDashboard");
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    console.log('Congratulations, your extension "open-data-studio" is now active!');
    // Register the Tree Data Provider
    const databaseProvider = new DatabaseTreeDataProvider_1.DatabaseTreeDataProvider();
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
        DatabaseDashboard_1.DatabaseDashboard.createOrShow(context.extensionUri, dbName);
    });
    let newQueryCommand = vscode.commands.registerCommand('open-data-studio.newQuery', async () => {
        const doc = await vscode.workspace.openTextDocument({ language: 'sql', content: '' });
        await vscode.window.showTextDocument(doc);
    });
    context.subscriptions.push(disposable);
    context.subscriptions.push(openDashboardCommand);
}
// This method is called when your extension is deactivated
function deactivate() { }
//# sourceMappingURL=extension.js.map