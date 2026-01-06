export class MockDatabaseService {
    public static getMockTables(): string[] {
        return [
            "dbo.Users",
            "dbo.Products",
            "dbo.Orders",
            "dbo.OrderDetails",
            "dbo.Customers",
            "dbo.Suppliers",
            "sales.Invoices",
            "sales.Transactions",
            "hr.Employees",
            "hr.Departments",
            "hr.Salaries",
            "audit.Logs",
            "audit.Events",
            "settings.Configurations",
            "settings.Preferences"
        ];
    }

    public static getMockStoredProcedures(): string[] {
        return [
            "dbo.sp_GetUsers",
            "dbo.sp_GetUserById",
            "dbo.sp_CreateUser",
            "dbo.sp_UpdateUser",
            "dbo.sp_DeleteUser",
            "sales.sp_GetMonthlySales",
            "sales.sp_GetYearlySales",
            "sales.sp_ProcessOrder",
            "hr.sp_CalculatePayroll",
            "hr.sp_GetEmployeeDetails",
            "audit.sp_LogEvent",
            "audit.sp_CleanOldLogs"
        ];
    }

    public static async executeMockQuery(query: string): Promise<any[]> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Return dummy data regardless of query
        return [
            { id: 1, name: "Alice", email: "alice@example.com", role: "Admin" },
            { id: 2, name: "Bob", email: "bob@example.com", role: "User" },
            { id: 3, name: "Charlie", email: "charlie@example.com", role: "User" },
            { id: 4, name: "David", email: "david@example.com", role: "Manager" },
            { id: 5, name: "Eve", email: "eve@example.com", role: "User" }
        ];
    }

    public static getMockTableSchema(tableName: string): any[] {
        // Parse table name (e.g., "dbo.Users" -> "Users")
        const parts = tableName.includes('.') ? tableName.split('.') : ['dbo', tableName];
        const table = parts[1];

        // Define mock schemas for common tables
        const schemas: { [key: string]: any[] } = {
            'Users': [
                { COLUMN_NAME: 'Id', DATA_TYPE: 'int', IS_NULLABLE: 'NO', IS_PRIMARY_KEY: 1 },
                { COLUMN_NAME: 'Username', DATA_TYPE: 'nvarchar', CHARACTER_MAXIMUM_LENGTH: 100, IS_NULLABLE: 'NO', IS_PRIMARY_KEY: 0 },
                { COLUMN_NAME: 'Email', DATA_TYPE: 'nvarchar', CHARACTER_MAXIMUM_LENGTH: 255, IS_NULLABLE: 'NO', IS_PRIMARY_KEY: 0 },
                { COLUMN_NAME: 'PasswordHash', DATA_TYPE: 'nvarchar', CHARACTER_MAXIMUM_LENGTH: 255, IS_NULLABLE: 'NO', IS_PRIMARY_KEY: 0 },
                { COLUMN_NAME: 'CreatedAt', DATA_TYPE: 'datetime2', IS_NULLABLE: 'NO', IS_PRIMARY_KEY: 0, COLUMN_DEFAULT: '(getutcdate())' },
                { COLUMN_NAME: 'IsActive', DATA_TYPE: 'bit', IS_NULLABLE: 'NO', IS_PRIMARY_KEY: 0, COLUMN_DEFAULT: '((1))' }
            ],
            'Products': [
                { COLUMN_NAME: 'ProductId', DATA_TYPE: 'int', IS_NULLABLE: 'NO', IS_PRIMARY_KEY: 1 },
                { COLUMN_NAME: 'Name', DATA_TYPE: 'nvarchar', CHARACTER_MAXIMUM_LENGTH: 200, IS_NULLABLE: 'NO', IS_PRIMARY_KEY: 0 },
                { COLUMN_NAME: 'Description', DATA_TYPE: 'nvarchar', CHARACTER_MAXIMUM_LENGTH: -1, IS_NULLABLE: 'YES', IS_PRIMARY_KEY: 0 },
                { COLUMN_NAME: 'Price', DATA_TYPE: 'decimal', NUMERIC_PRECISION: 18, NUMERIC_SCALE: 2, IS_NULLABLE: 'NO', IS_PRIMARY_KEY: 0 },
                { COLUMN_NAME: 'StockQuantity', DATA_TYPE: 'int', IS_NULLABLE: 'NO', IS_PRIMARY_KEY: 0, COLUMN_DEFAULT: '((0))' },
                { COLUMN_NAME: 'CategoryId', DATA_TYPE: 'int', IS_NULLABLE: 'YES', IS_PRIMARY_KEY: 0 }
            ],
            'Orders': [
                { COLUMN_NAME: 'OrderId', DATA_TYPE: 'int', IS_NULLABLE: 'NO', IS_PRIMARY_KEY: 1 },
                { COLUMN_NAME: 'CustomerId', DATA_TYPE: 'int', IS_NULLABLE: 'NO', IS_PRIMARY_KEY: 0 },
                { COLUMN_NAME: 'OrderDate', DATA_TYPE: 'datetime2', IS_NULLABLE: 'NO', IS_PRIMARY_KEY: 0, COLUMN_DEFAULT: '(getutcdate())' },
                { COLUMN_NAME: 'TotalAmount', DATA_TYPE: 'decimal', NUMERIC_PRECISION: 18, NUMERIC_SCALE: 2, IS_NULLABLE: 'NO', IS_PRIMARY_KEY: 0 },
                { COLUMN_NAME: 'Status', DATA_TYPE: 'nvarchar', CHARACTER_MAXIMUM_LENGTH: 50, IS_NULLABLE: 'NO', IS_PRIMARY_KEY: 0, COLUMN_DEFAULT: '(N\'Pending\')' }
            ],
            'Employees': [
                { COLUMN_NAME: 'EmployeeId', DATA_TYPE: 'int', IS_NULLABLE: 'NO', IS_PRIMARY_KEY: 1 },
                { COLUMN_NAME: 'FirstName', DATA_TYPE: 'nvarchar', CHARACTER_MAXIMUM_LENGTH: 100, IS_NULLABLE: 'NO', IS_PRIMARY_KEY: 0 },
                { COLUMN_NAME: 'LastName', DATA_TYPE: 'nvarchar', CHARACTER_MAXIMUM_LENGTH: 100, IS_NULLABLE: 'NO', IS_PRIMARY_KEY: 0 },
                { COLUMN_NAME: 'DepartmentId', DATA_TYPE: 'int', IS_NULLABLE: 'YES', IS_PRIMARY_KEY: 0 },
                { COLUMN_NAME: 'HireDate', DATA_TYPE: 'date', IS_NULLABLE: 'NO', IS_PRIMARY_KEY: 0 },
                { COLUMN_NAME: 'Salary', DATA_TYPE: 'decimal', NUMERIC_PRECISION: 18, NUMERIC_SCALE: 2, IS_NULLABLE: 'NO', IS_PRIMARY_KEY: 0 }
            ]
        };

        // Return schema if we have it, otherwise return a generic schema
        return schemas[table] || [
            { COLUMN_NAME: 'Id', DATA_TYPE: 'int', IS_NULLABLE: 'NO', IS_PRIMARY_KEY: 1 },
            { COLUMN_NAME: 'Name', DATA_TYPE: 'nvarchar', CHARACTER_MAXIMUM_LENGTH: 255, IS_NULLABLE: 'NO', IS_PRIMARY_KEY: 0 },
            { COLUMN_NAME: 'CreatedAt', DATA_TYPE: 'datetime2', IS_NULLABLE: 'NO', IS_PRIMARY_KEY: 0, COLUMN_DEFAULT: '(getutcdate())' }
        ];
    }
}
