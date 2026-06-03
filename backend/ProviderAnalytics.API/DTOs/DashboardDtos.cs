namespace ProviderAnalytics.API.DTOs;

public record DashboardKpiDto(
    decimal AverageScore,
    int TotalProviders,
    int AtRiskProviders,
    decimal MonthlyImprovement
);

public record MonthlyTrendDto(
    string Month,
    decimal AverageScore
);

public record RiskDistributionDto(
    string Status,
    int Count
);

public record ProviderPerformanceDto(
    string ProviderName,
    decimal AverageScore,
    string Status
);

public record DashboardAnalyticsDto(
    DashboardKpiDto Kpis,
    List<MonthlyTrendDto> MonthlyTrends,
    List<RiskDistributionDto> RiskDistribution,
    List<ProviderPerformanceDto> TopProviders,
    List<ProviderPerformanceDto> BottomProviders
);

public record AuditLogDto(
    int Id,
    string EntityName,
    string ActionType,
    int EntityId,
    string? ModifiedBy,
    DateTime Timestamp
);

public record AdminSummaryDto(
    int TotalUsers,
    int ActiveUsers,
    int TotalAuditLogs,
    List<AuditLogDto> RecentActivity
);

public record CategoryScoreDto(
    string Category,
    decimal AverageScore
);

public record ProviderDashboardDto(
    string ProviderName,
    string Specialty,
    string Status,
    string? Location,
    decimal OverallScore,
    int TotalEvaluations,
    decimal MonthlyChange,
    List<MonthlyTrendDto> ScoreTrends,
    List<CategoryScoreDto> CategoryScores,
    List<ProviderScoreDto> RecentScores
);
