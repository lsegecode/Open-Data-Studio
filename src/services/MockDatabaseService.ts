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
}
