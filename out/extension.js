"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const DatabaseTreeDataProvider_1 = require("./providers/DatabaseTreeDataProvider");
const DatabaseDashboard_1 = require("./panels/DatabaseDashboard");
const ConnectionManager_1 = require("./services/ConnectionManager");
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    console.log('Congratulations, your extension "open-data-studio" is now active!');
    // Register the Tree Data Provider
    const databaseProvider = new DatabaseTreeDataProvider_1.DatabaseTreeDataProvider();
    vscode.window.registerTreeDataProvider('openDataExplorer', databaseProvider);
    // Initialize ConnectionManager
    ConnectionManager_1.ConnectionManager.getInstance(context);
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
    let addConnectionCommand = vscode.commands.registerCommand('open-data-studio.addConnection', async () => {
        const server = await vscode.window.showInputBox({
            prompt: 'Enter SQL Server Host/IP',
            placeHolder: 'localhost or 192.168.1.10',
            ignoreFocusOut: true
        });
        if (!server)
            return;
        const authType = await vscode.window.showQuickPick(['SqlLogin', 'Integrated'], {
            placeHolder: 'Select Authentication Type',
            ignoreFocusOut: true
        });
        if (!authType)
            return;
        let user, password;
        if (authType === 'SqlLogin') {
            user = await vscode.window.showInputBox({
                prompt: 'Enter Username',
                ignoreFocusOut: true
            });
            if (!user)
                return;
            password = await vscode.window.showInputBox({
                prompt: 'Enter Password',
                password: true,
                ignoreFocusOut: true
            });
            if (!password)
                return;
        }
        const connection = {
            id: Date.now().toString(),
            label: server,
            server: server,
            authenticationType: authType,
            user,
            password
        };
        try {
            await ConnectionManager_1.ConnectionManager.getInstance().addConnection(connection);
            databaseProvider.refresh();
            vscode.window.showInformationMessage(`Connection to ${server} added!`);
        }
        catch (err) {
            vscode.window.showErrorMessage(`Failed to add connection: ${err.message || err}`);
        }
    });
    context.subscriptions.push(disposable);
    context.subscriptions.push(openDashboardCommand);
    context.subscriptions.push(addConnectionCommand);
}
// This method is called when your extension is deactivated
function deactivate() { }
//# sourceMappingURL=extension.js.map