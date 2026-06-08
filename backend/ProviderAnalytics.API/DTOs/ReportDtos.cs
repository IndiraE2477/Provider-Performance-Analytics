namespace ProviderAnalytics.API.DTOs;

public record ReportProviderDto(
    int Id,
    string Name,
    string Specialty,
    string? Email,
    string? Phone,
    string? Location,
    string Status,
    decimal AverageScore,
    int TotalEvaluations,
    DateTime? LastEvaluationDate,
    DateTime CreatedAt
);

public record ReportDataDto(
    DateTime GeneratedAt,
    DashboardKpiDto Kpis,
    List<MonthlyTrendDto> MonthlyTrends,
    List<RiskDistributionDto> RiskDistribution,
    List<ProviderPerformanceDto> TopProviders,
    List<ProviderPerformanceDto> BottomProviders,
    List<ReportProviderDto> AllProviders
);
