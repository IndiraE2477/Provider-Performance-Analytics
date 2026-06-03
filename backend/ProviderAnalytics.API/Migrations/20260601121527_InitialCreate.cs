using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ProviderAnalytics.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EntityName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ActionType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    EntityId = table.Column<int>(type: "int", nullable: false),
                    OldValues = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NewValues = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ModifiedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ErrorLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StackTrace = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Source = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Path = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Method = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    StatusCode = table.Column<int>(type: "int", nullable: true),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ErrorLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Providers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Specialty = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Location = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Active"),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Providers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProviderScores",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProviderId = table.Column<int>(type: "int", nullable: false),
                    Score = table.Column<decimal>(type: "decimal(3,2)", precision: 3, scale: 2, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    EvaluationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EvaluatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProviderScores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProviderScores_Providers_ProviderId",
                        column: x => x.ProviderId,
                        principalTable: "Providers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Username = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    RoleId = table.Column<int>(type: "int", nullable: false),
                    ProviderId = table.Column<int>(type: "int", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastLogin = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_Providers_ProviderId",
                        column: x => x.ProviderId,
                        principalTable: "Providers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Users_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "Providers",
                columns: new[] { "Id", "CreatedAt", "CreatedBy", "Email", "IsDeleted", "Location", "Name", "Phone", "Specialty", "Status", "UpdatedAt", "UpdatedBy" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", "sarah.johnson@health.com", false, "New York", "Dr. Sarah Johnson", "555-0101", "Cardiology", "Active", null, null },
                    { 2, new DateTime(2026, 1, 20, 0, 0, 0, 0, DateTimeKind.Utc), "admin", "michael.chen@health.com", false, "Los Angeles", "Dr. Michael Chen", "555-0102", "Neurology", "Active", null, null },
                    { 3, new DateTime(2026, 2, 1, 0, 0, 0, 0, DateTimeKind.Utc), "admin", "emily.davis@health.com", false, "Chicago", "Dr. Emily Davis", "555-0103", "Pediatrics", "Active", null, null },
                    { 4, new DateTime(2026, 2, 10, 0, 0, 0, 0, DateTimeKind.Utc), "admin", "james.wilson@health.com", false, "Houston", "Dr. James Wilson", "555-0104", "Orthopedics", "At-Risk", null, null },
                    { 5, new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", "lisa.anderson@health.com", false, "Phoenix", "Dr. Lisa Anderson", "555-0105", "Dermatology", "Active", null, null },
                    { 6, new DateTime(2026, 3, 1, 0, 0, 0, 0, DateTimeKind.Utc), "admin", "robert.martinez@health.com", false, "Philadelphia", "Dr. Robert Martinez", "555-0106", "Oncology", "At-Risk", null, null },
                    { 7, new DateTime(2026, 3, 5, 0, 0, 0, 0, DateTimeKind.Utc), "admin", "jennifer.taylor@health.com", false, "San Antonio", "Dr. Jennifer Taylor", "555-0107", "Cardiology", "Active", null, null },
                    { 8, new DateTime(2026, 3, 10, 0, 0, 0, 0, DateTimeKind.Utc), "admin", "david.brown@health.com", false, "San Diego", "Dr. David Brown", "555-0108", "Neurology", "Active", null, null },
                    { 9, new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", "amanda.white@health.com", false, "Dallas", "Dr. Amanda White", "555-0109", "Pediatrics", "Inactive", null, null },
                    { 10, new DateTime(2026, 3, 20, 0, 0, 0, 0, DateTimeKind.Utc), "admin", "christopher.lee@health.com", false, "San Jose", "Dr. Christopher Lee", "555-0110", "Orthopedics", "Active", null, null }
                });

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "CreatedAt", "Description", "Name" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Full system access", "Admin" },
                    { 2, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Can manage providers and view reports", "Manager" },
                    { 3, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Read-only access to dashboards", "Viewer" }
                });

            migrationBuilder.InsertData(
                table: "ProviderScores",
                columns: new[] { "Id", "Category", "CreatedAt", "EvaluatedBy", "EvaluationDate", "Notes", "ProviderId", "Score" },
                values: new object[,]
                {
                    { 1, "Quality of Care", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 1, 4.50m },
                    { 2, "Patient Satisfaction", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 1, 3.71m },
                    { 3, "Efficiency", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 1, 3.69m },
                    { 4, "Communication", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 1, 4.28m },
                    { 5, "Compliance", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 1, 3.75m },
                    { 6, "Quality of Care", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 1, 3.89m },
                    { 7, "Patient Satisfaction", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 1, 4.59m },
                    { 8, "Efficiency", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 1, 4.27m },
                    { 9, "Communication", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 1, 3.76m },
                    { 10, "Compliance", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 1, 4.64m },
                    { 11, "Quality of Care", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 1, 3.85m },
                    { 12, "Patient Satisfaction", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 1, 3.89m },
                    { 13, "Efficiency", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 1, 4.26m },
                    { 14, "Communication", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 1, 3.98m },
                    { 15, "Compliance", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 1, 4.07m },
                    { 16, "Quality of Care", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 1, 3.89m },
                    { 17, "Patient Satisfaction", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 1, 4.28m },
                    { 18, "Efficiency", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 1, 3.55m },
                    { 19, "Communication", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 1, 4.72m },
                    { 20, "Compliance", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 1, 4.37m },
                    { 21, "Quality of Care", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 1, 4.10m },
                    { 22, "Patient Satisfaction", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 1, 3.73m },
                    { 23, "Efficiency", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 1, 3.64m },
                    { 24, "Communication", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 1, 4.56m },
                    { 25, "Compliance", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 1, 4.72m },
                    { 26, "Quality of Care", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 2, 4.31m },
                    { 27, "Patient Satisfaction", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 2, 3.57m },
                    { 28, "Efficiency", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 2, 4.57m },
                    { 29, "Communication", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 2, 3.72m },
                    { 30, "Compliance", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 2, 4.86m },
                    { 31, "Quality of Care", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 2, 4.54m },
                    { 32, "Patient Satisfaction", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 2, 4.27m },
                    { 33, "Efficiency", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 2, 3.78m },
                    { 34, "Communication", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 2, 3.56m },
                    { 35, "Compliance", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 2, 3.96m },
                    { 36, "Quality of Care", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 2, 4.37m },
                    { 37, "Patient Satisfaction", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 2, 4.73m },
                    { 38, "Efficiency", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 2, 3.51m },
                    { 39, "Communication", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 2, 4.30m },
                    { 40, "Compliance", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 2, 4.71m },
                    { 41, "Quality of Care", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 2, 4.62m },
                    { 42, "Patient Satisfaction", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 2, 4.08m },
                    { 43, "Efficiency", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 2, 3.72m },
                    { 44, "Communication", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 2, 3.54m },
                    { 45, "Compliance", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 2, 3.58m },
                    { 46, "Quality of Care", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 2, 4.67m },
                    { 47, "Patient Satisfaction", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 2, 4.44m },
                    { 48, "Efficiency", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 2, 3.67m },
                    { 49, "Communication", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 2, 3.87m },
                    { 50, "Compliance", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 2, 4.66m },
                    { 51, "Quality of Care", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 3, 3.93m },
                    { 52, "Patient Satisfaction", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 3, 4.47m },
                    { 53, "Efficiency", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 3, 3.72m },
                    { 54, "Communication", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 3, 3.57m },
                    { 55, "Compliance", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 3, 4.41m },
                    { 56, "Quality of Care", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 3, 4.27m },
                    { 57, "Patient Satisfaction", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 3, 3.58m },
                    { 58, "Efficiency", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 3, 4.13m },
                    { 59, "Communication", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 3, 4.56m },
                    { 60, "Compliance", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 3, 4.44m },
                    { 61, "Quality of Care", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 3, 3.83m },
                    { 62, "Patient Satisfaction", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 3, 3.52m },
                    { 63, "Efficiency", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 3, 4.05m },
                    { 64, "Communication", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 3, 3.90m },
                    { 65, "Compliance", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 3, 3.60m },
                    { 66, "Quality of Care", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 3, 4.58m },
                    { 67, "Patient Satisfaction", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 3, 3.61m },
                    { 68, "Efficiency", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 3, 4.20m },
                    { 69, "Communication", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 3, 3.52m },
                    { 70, "Compliance", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 3, 4.70m },
                    { 71, "Quality of Care", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 3, 4.16m },
                    { 72, "Patient Satisfaction", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 3, 4.27m },
                    { 73, "Efficiency", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 3, 4.25m },
                    { 74, "Communication", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 3, 3.51m },
                    { 75, "Compliance", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 3, 4.74m },
                    { 76, "Quality of Care", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 4, 2.02m },
                    { 77, "Patient Satisfaction", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 4, 2.00m },
                    { 78, "Efficiency", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 4, 2.10m },
                    { 79, "Communication", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 4, 2.98m },
                    { 80, "Compliance", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 4, 2.05m },
                    { 81, "Quality of Care", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 4, 3.37m },
                    { 82, "Patient Satisfaction", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 4, 3.39m },
                    { 83, "Efficiency", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 4, 2.69m },
                    { 84, "Communication", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 4, 2.56m },
                    { 85, "Compliance", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 4, 2.92m },
                    { 86, "Quality of Care", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 4, 2.07m },
                    { 87, "Patient Satisfaction", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 4, 2.56m },
                    { 88, "Efficiency", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 4, 2.21m },
                    { 89, "Communication", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 4, 2.66m },
                    { 90, "Compliance", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 4, 3.19m },
                    { 91, "Quality of Care", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 4, 2.80m },
                    { 92, "Patient Satisfaction", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 4, 2.60m },
                    { 93, "Efficiency", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 4, 2.45m },
                    { 94, "Communication", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 4, 3.36m },
                    { 95, "Compliance", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 4, 2.88m },
                    { 96, "Quality of Care", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 4, 3.10m },
                    { 97, "Patient Satisfaction", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 4, 2.03m },
                    { 98, "Efficiency", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 4, 3.32m },
                    { 99, "Communication", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 4, 3.44m },
                    { 100, "Compliance", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 4, 2.50m },
                    { 101, "Quality of Care", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 5, 4.57m },
                    { 102, "Patient Satisfaction", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 5, 3.74m },
                    { 103, "Efficiency", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 5, 3.65m },
                    { 104, "Communication", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 5, 4.18m },
                    { 105, "Compliance", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 5, 4.00m },
                    { 106, "Quality of Care", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 5, 4.66m },
                    { 107, "Patient Satisfaction", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 5, 3.72m },
                    { 108, "Efficiency", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 5, 3.70m },
                    { 109, "Communication", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 5, 3.82m },
                    { 110, "Compliance", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 5, 4.39m },
                    { 111, "Quality of Care", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 5, 4.27m },
                    { 112, "Patient Satisfaction", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 5, 4.98m },
                    { 113, "Efficiency", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 5, 4.65m },
                    { 114, "Communication", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 5, 4.51m },
                    { 115, "Compliance", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 5, 4.57m },
                    { 116, "Quality of Care", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 5, 3.93m },
                    { 117, "Patient Satisfaction", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 5, 4.33m },
                    { 118, "Efficiency", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 5, 4.98m },
                    { 119, "Communication", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 5, 4.48m },
                    { 120, "Compliance", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 5, 3.54m },
                    { 121, "Quality of Care", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 5, 4.02m },
                    { 122, "Patient Satisfaction", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 5, 4.89m },
                    { 123, "Efficiency", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 5, 3.54m },
                    { 124, "Communication", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 5, 3.83m },
                    { 125, "Compliance", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 5, 3.90m },
                    { 126, "Quality of Care", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 6, 1.86m },
                    { 127, "Patient Satisfaction", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 6, 2.12m },
                    { 128, "Efficiency", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 6, 2.69m },
                    { 129, "Communication", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 6, 2.43m },
                    { 130, "Compliance", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 6, 1.94m },
                    { 131, "Quality of Care", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 6, 3.29m },
                    { 132, "Patient Satisfaction", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 6, 1.98m },
                    { 133, "Efficiency", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 6, 1.96m },
                    { 134, "Communication", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 6, 2.28m },
                    { 135, "Compliance", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 6, 2.29m },
                    { 136, "Quality of Care", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 6, 2.93m },
                    { 137, "Patient Satisfaction", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 6, 3.04m },
                    { 138, "Efficiency", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 6, 1.81m },
                    { 139, "Communication", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 6, 1.86m },
                    { 140, "Compliance", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 6, 3.06m },
                    { 141, "Quality of Care", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 6, 3.14m },
                    { 142, "Patient Satisfaction", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 6, 2.16m },
                    { 143, "Efficiency", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 6, 3.19m },
                    { 144, "Communication", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 6, 3.07m },
                    { 145, "Compliance", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 6, 2.22m },
                    { 146, "Quality of Care", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 6, 2.62m },
                    { 147, "Patient Satisfaction", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 6, 2.75m },
                    { 148, "Efficiency", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 6, 2.74m },
                    { 149, "Communication", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 6, 2.09m },
                    { 150, "Compliance", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 6, 2.25m },
                    { 151, "Quality of Care", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 7, 3.77m },
                    { 152, "Patient Satisfaction", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 7, 3.54m },
                    { 153, "Efficiency", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 7, 3.85m },
                    { 154, "Communication", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 7, 4.90m },
                    { 155, "Compliance", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 7, 4.98m },
                    { 156, "Quality of Care", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 7, 4.67m },
                    { 157, "Patient Satisfaction", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 7, 3.70m },
                    { 158, "Efficiency", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 7, 4.83m },
                    { 159, "Communication", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 7, 3.78m },
                    { 160, "Compliance", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 7, 3.94m },
                    { 161, "Quality of Care", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 7, 4.34m },
                    { 162, "Patient Satisfaction", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 7, 4.33m },
                    { 163, "Efficiency", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 7, 4.57m },
                    { 164, "Communication", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 7, 3.68m },
                    { 165, "Compliance", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 7, 4.40m },
                    { 166, "Quality of Care", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 7, 4.09m },
                    { 167, "Patient Satisfaction", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 7, 4.82m },
                    { 168, "Efficiency", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 7, 4.17m },
                    { 169, "Communication", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 7, 4.02m },
                    { 170, "Compliance", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 7, 4.95m },
                    { 171, "Quality of Care", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 7, 4.20m },
                    { 172, "Patient Satisfaction", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 7, 4.31m },
                    { 173, "Efficiency", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 7, 4.92m },
                    { 174, "Communication", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 7, 4.72m },
                    { 175, "Compliance", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 7, 3.69m },
                    { 176, "Quality of Care", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 8, 3.66m },
                    { 177, "Patient Satisfaction", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 8, 3.50m },
                    { 178, "Efficiency", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 8, 3.77m },
                    { 179, "Communication", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 8, 4.91m },
                    { 180, "Compliance", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 8, 4.58m },
                    { 181, "Quality of Care", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 8, 4.11m },
                    { 182, "Patient Satisfaction", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 8, 4.39m },
                    { 183, "Efficiency", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 8, 4.10m },
                    { 184, "Communication", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 8, 3.69m },
                    { 185, "Compliance", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 8, 4.87m },
                    { 186, "Quality of Care", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 8, 4.95m },
                    { 187, "Patient Satisfaction", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 8, 4.84m },
                    { 188, "Efficiency", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 8, 3.76m },
                    { 189, "Communication", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 8, 4.00m },
                    { 190, "Compliance", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 8, 4.31m },
                    { 191, "Quality of Care", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 8, 4.42m },
                    { 192, "Patient Satisfaction", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 8, 4.91m },
                    { 193, "Efficiency", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 8, 4.73m },
                    { 194, "Communication", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 8, 4.62m },
                    { 195, "Compliance", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 8, 3.92m },
                    { 196, "Quality of Care", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 8, 4.01m },
                    { 197, "Patient Satisfaction", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 8, 4.29m },
                    { 198, "Efficiency", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 8, 4.71m },
                    { 199, "Communication", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 8, 3.87m },
                    { 200, "Compliance", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 8, 4.83m },
                    { 201, "Quality of Care", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 9, 3.50m },
                    { 202, "Patient Satisfaction", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 9, 2.78m },
                    { 203, "Efficiency", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 9, 2.92m },
                    { 204, "Communication", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 9, 2.84m },
                    { 205, "Compliance", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 9, 3.75m },
                    { 206, "Quality of Care", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 9, 3.46m },
                    { 207, "Patient Satisfaction", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 9, 2.62m },
                    { 208, "Efficiency", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 9, 3.13m },
                    { 209, "Communication", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 9, 3.71m },
                    { 210, "Compliance", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 9, 3.82m },
                    { 211, "Quality of Care", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 9, 3.67m },
                    { 212, "Patient Satisfaction", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 9, 3.93m },
                    { 213, "Efficiency", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 9, 3.91m },
                    { 214, "Communication", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 9, 3.20m },
                    { 215, "Compliance", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 9, 3.84m },
                    { 216, "Quality of Care", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 9, 3.95m },
                    { 217, "Patient Satisfaction", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 9, 2.73m },
                    { 218, "Efficiency", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 9, 3.38m },
                    { 219, "Communication", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 9, 2.82m },
                    { 220, "Compliance", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 9, 3.45m },
                    { 221, "Quality of Care", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 9, 3.25m },
                    { 222, "Patient Satisfaction", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 9, 3.56m },
                    { 223, "Efficiency", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 9, 2.67m },
                    { 224, "Communication", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 9, 3.71m },
                    { 225, "Compliance", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 9, 3.02m },
                    { 226, "Quality of Care", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 10, 4.28m },
                    { 227, "Patient Satisfaction", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 10, 4.58m },
                    { 228, "Efficiency", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 10, 3.80m },
                    { 229, "Communication", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 10, 4.29m },
                    { 230, "Compliance", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 10, 4.68m },
                    { 231, "Quality of Care", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 10, 4.37m },
                    { 232, "Patient Satisfaction", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 10, 3.80m },
                    { 233, "Efficiency", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 10, 4.90m },
                    { 234, "Communication", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 10, 3.58m },
                    { 235, "Compliance", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 2, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 10, 3.58m },
                    { 236, "Quality of Care", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 10, 3.82m },
                    { 237, "Patient Satisfaction", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 10, 3.97m },
                    { 238, "Efficiency", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 10, 3.76m },
                    { 239, "Communication", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 10, 3.94m },
                    { 240, "Compliance", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 10, 3.91m },
                    { 241, "Quality of Care", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 10, 4.82m },
                    { 242, "Patient Satisfaction", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 10, 4.21m },
                    { 243, "Efficiency", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 10, 4.05m },
                    { 244, "Communication", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 10, 4.18m },
                    { 245, "Compliance", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 4, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 10, 4.65m },
                    { 246, "Quality of Care", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Quality of Care", 10, 4.49m },
                    { 247, "Patient Satisfaction", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Patient Satisfaction", 10, 5.0m },
                    { 248, "Efficiency", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Efficiency", 10, 4.03m },
                    { 249, "Communication", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Communication", 10, 4.78m },
                    { 250, "Compliance", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "admin", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly evaluation for Compliance", 10, 3.97m }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "Email", "FullName", "IsActive", "LastLogin", "PasswordHash", "ProviderId", "RoleId", "Username" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "admin@provideranalytics.com", "System Administrator", true, null, "$2a$11$Czhl.iZE3b9JcZG0K2Fq7elMyMxFLvZU2wkw1DGsDnztGTaFmkij.", null, 1, "admin" },
                    { 2, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "manager@provideranalytics.com", "Team Manager", true, null, "$2a$11$Czhl.iZE3b9JcZG0K2Fq7elMyMxFLvZU2wkw1DGsDnztGTaFmkij.", null, 2, "manager" },
                    { 3, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "viewer@provideranalytics.com", "Dr. Sarah Johnson", true, null, "$2a$11$Czhl.iZE3b9JcZG0K2Fq7elMyMxFLvZU2wkw1DGsDnztGTaFmkij.", 1, 3, "viewer" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Providers_Name",
                table: "Providers",
                column: "Name",
                unique: true,
                filter: "[IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_ProviderScores_ProviderId",
                table: "ProviderScores",
                column: "ProviderId");

            migrationBuilder.CreateIndex(
                name: "IX_Roles_Name",
                table: "Roles",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_ProviderId",
                table: "Users",
                column: "ProviderId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_RoleId",
                table: "Users",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AuditLogs");

            migrationBuilder.DropTable(
                name: "ErrorLogs");

            migrationBuilder.DropTable(
                name: "ProviderScores");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Providers");

            migrationBuilder.DropTable(
                name: "Roles");
        }
    }
}
