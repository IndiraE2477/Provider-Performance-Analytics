namespace ProviderAnalytics.API.DTOs;

// AI Risk Prediction
public record RiskPredictionDto(
    int ProviderId,
    string ProviderName,
    string RiskLevel,
    decimal RiskProbability,
    string Recommendation,
    List<string> RiskFactors,
    DateTime PredictedAt
);

// AI Performance Summary
public record PerformanceSummaryDto(
    int ProviderId,
    string ProviderName,
    string Summary,
    List<string> Strengths,
    List<string> AreasForImprovement,
    string TrendDirection,
    DateTime GeneratedAt
);

// AI Dashboard Insights
public record DashboardInsightDto(
    string InsightType,
    string Title,
    string Description,
    string Severity,
    DateTime GeneratedAt
);

// AI Error Log Analysis
public record ErrorLogAnalysisDto(
    string Pattern,
    int Occurrences,
    string RootCause,
    string Suggestion,
    string Severity,
    List<int> AffectedErrorIds
);

// AI Assistant
public record AiAssistantRequestDto(
    string Question
);

public record AiAssistantResponseDto(
    string Answer,
    string QuestionType,
    object? Data,
    DateTime RespondedAt
);

// AI Recommendation
public record AiRecommendationDto(
    int ProviderId,
    string ProviderName,
    string Action,
    string Reason,
    string Priority,
    DateTime GeneratedAt
);
