export interface ConnectionInfo {
    id: string; // Unique identifier for the connection
    label: string; // Display name (e.g., Server Name)
    server: string;
    authenticationType: 'SqlLogin' | 'Integrated';
    user?: string;
    password?: string; // Stored securely, not persisted in plain text settings
    database?: string; // Optional default database
    port?: number;
}