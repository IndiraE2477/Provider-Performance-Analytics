using ProviderAnalytics.API.DTOs;

namespace ProviderAnalytics.API.Services.Interfaces;

public interface IAiService
{
    Task<List<RiskPredictionDto>> GetRiskPredictionsAsync();
    Task<RiskPredictionDto?> GetProviderRiskPredictionAsync(int providerId);
    Task<PerformanceSummaryDto?> GetPerformanceSummaryAsync(int providerId);
    Task<List<DashboardInsightDto>> GetDashboardInsightsAsync();
    Task<List<ErrorLogAnalysisDto>> GetErrorLogAnalysisAsync();
    Task<AiAssistantResponseDto> AskAssistantAsync(string question);
    Task<List<AiRecommendationDto>> GetRecommendationsAsync(int providerId);
}
