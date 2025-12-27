"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseDashboard = void 0;
const vscode = require("vscode");
class DatabaseDashboard {
    constructor(panel, extensionUri, databaseName) {
        this._disposables = [];
        this._panel = panel;
        this._databaseName = databaseName;
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.webview.html = this._getHtmlForWebview(databaseName);
    }
    static createOrShow(extensionUri, databaseName) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;
        // If we already have a panel, show it.
        if (DatabaseDashboard.currentPanel) {
            // Update the existing panel if the database is different
            if (DatabaseDashboard.currentPanel._databaseName !== databaseName) {
                DatabaseDashboard.currentPanel._update(databaseName);
            }
            DatabaseDashboard.currentPanel._panel.reveal(column);
            return;
        }
        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel("openDataDashboard", `Dashboard: ${databaseName}`, column || vscode.ViewColumn.One, {
            enableScripts: true,
        });
        DatabaseDashboard.currentPanel = new DatabaseDashboard(panel, extensionUri, databaseName);
    }
    _update(databaseName) {
        this._databaseName = databaseName;
        this._panel.title = `Dashboard: ${databaseName}`;
        this._panel.webview.html = this._getHtmlForWebview(databaseName);
    }
    dispose() {
        DatabaseDashboard.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
    _getHtmlForWebview(databaseName) {
        return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Database Dashboard</title>
        <style>
            body { font-family: var(--vscode-font-family); color: var(--vscode-editor-foreground); padding: 20px; }
            h1 { color: var(--vscode-editor-foreground); }
            input[type="text"] {
                width: 100%;
                padding: 10px;
                font-size: 16px;
                margin-bottom: 20px;
                background-color: var(--vscode-input-background);
                color: var(--vscode-input-foreground);
                border: 1px solid var(--vscode-input-border);
            }
            .section { margin-bottom: 30px; }
            .item { padding: 5px 10px; border-bottom: 1px solid var(--vscode-panel-border); cursor: pointer; }
            .item:hover { background-color: var(--vscode-list-hoverBackground); }
        </style>
    </head>
    <body>
        <h1>Dashboard - ${databaseName}</h1>
        <input type="text" id="searchBar" placeholder="Search tables, procedures..." onkeyup="filterList()">

        <div class="section">
            <h2>Tables</h2>
            <div id="tablesList">
                <div class="item">dbo.Users</div>
                <div class="item">dbo.Products</div>
                <div class="item">sales.Orders</div>
                <div class="item">sales.OrderDetails</div>
            </div>
        </div>

        <div class="section">
            <h2>Stored Procedures</h2>
            <div id="proceduresList">
                <div class="item">dbo.sp_GetUsers</div>
                <div class="item">sales.sp_UpdateOrder</div>
            </div>
        </div>

        <script>
            function filterList() {
                const input = document.getElementById('searchBar');
                const filter = input.value.toUpperCase();
                const items = document.getElementsByClassName('item');

                for (let i = 0; i < items.length; i++) {
                    const txtValue = items[i].textContent || items[i].innerText;
                    if (txtValue.toUpperCase().indexOf(filter) > -1) {
                        items[i].style.display = "";
                    } else {
                        items[i].style.display = "none";
                    }
                }
            }
        </script>
    </body>
    </html>`;
    }
}
exports.DatabaseDashboard = DatabaseDashboard;
//# sourceMappingURL=DatabaseDashboard.js.map