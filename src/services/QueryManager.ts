import * as vscode from 'vscode';
import { ConnectionInfo } from '../models/ConnectionInfo';


export class QueryManager {
    private static instance: QueryManager;
    private documentConnections: Map<string, { connectionId: string; databaseName: string }> = new Map();

    private constructor() { }

    public static getInstance(): QueryManager {
        if (!QueryManager.instance) {
            QueryManager.instance = new QueryManager();
        }
        return QueryManager.instance;
    }

    public registerQueryDocument(uri: vscode.Uri, connectionId: string, databaseName: string) {
        this.documentConnections.set(uri.toString(), { connectionId, databaseName });
    }

    public getConnectionForDocument(uri: vscode.Uri): { connectionId: string; databaseName: string } | undefined {
        return this.documentConnections.get(uri.toString());
    }

    public removeDocument(uri: vscode.Uri) {
        this.documentConnections.delete(uri.toString());
    }
}
