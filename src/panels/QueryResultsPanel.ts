import * as vscode from "vscode";

export class QueryResultsPanel {
    public static currentPanel: QueryResultsPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _disposables: vscode.Disposable[] = [];

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, results: any[]) {
        this._panel = panel;
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.webview.html = this._getHtmlForWebview(results);
    }

    public static createOrShow(extensionUri: vscode.Uri, results: any[]) {
        const column = vscode.ViewColumn.Two;

        if (QueryResultsPanel.currentPanel) {
            QueryResultsPanel.currentPanel._update(results);
            QueryResultsPanel.currentPanel._panel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            "queryResults",
            "Query Results",
            column,
            {
                enableScripts: true,
            }
        );

        QueryResultsPanel.currentPanel = new QueryResultsPanel(panel, extensionUri, results);
    }

    public _update(results: any[]) {
        this._panel.webview.html = this._getHtmlForWebview(results);
    }

    public dispose() {
        QueryResultsPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _getHtmlForWebview(results: any[]) {
        if (!results || results.length === 0) {
            return `<!DOCTYPE html>
            <html lang="en">
            <body>
                <h1>Query Results</h1>
                <p>No results returned.</p>
            </body>
            </html>`;
        }

        const columns = Object.keys(results[0]);
        const headerRow = columns.map(col => `<th>${col}</th>`).join('');
        const rows = results.map(row => {
            const cells = columns.map(col => `<td>${row[col]}</td>`).join('');
            return `<tr>${cells}</tr>`;
        }).join('');

        return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Query Results</title>
        <style>
            body { font-family: var(--vscode-font-family); color: var(--vscode-editor-foreground); padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid var(--vscode-panel-border); padding: 5px; text-align: left; }
            th { background-color: var(--vscode-editor-background); }
            tr:nth-child(even) { background-color: var(--vscode-list-hoverBackground); }
        </style>
    </head>
    <body>
        <h1>Query Results</h1>
        <table>
            <thead>
                <tr>${headerRow}</tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    </body>
    </html>`;
    }
}
