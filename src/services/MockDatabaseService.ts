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
}
