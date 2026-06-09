using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using ProviderAnalytics.API.Data;
using ProviderAnalytics.API.DTOs;
using ProviderAnalytics.API.Services.Interfaces;

namespace ProviderAnalytics.API.Services;

public class AiService : IAiService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AiService> _logger;
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _modelId;
    private readonly string _projectId;
    private readonly string _location;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    public AiService(ApplicationDbContext context, ILogger<AiService> logger, HttpClient httpClient, IConfiguration configuration)
    {
        _context = context;
        _logger = logger;
        _httpClient = httpClient;

        var openAiKey = configuration["OpenAI:ApiKey"];
        var vertexKey = configuration["VertexAI:ApiKey"];
        _apiKey = !string.IsNullOrWhiteSpace(openAiKey) ? openAiKey : (!string.IsNullOrWhiteSpace(vertexKey) ? vertexKey : "");

        _modelId = configuration["OpenAI:Model"] ?? "google/gemini-2.0-flash-001";
        _projectId = configuration["VertexAI:ProjectId"] ?? "";
        _location = configuration["VertexAI:Location"] ?? "us-central1";
    }

    // ---- OpenRouter API Call ----

    private async Task<string> CallGeminiAsync(string prompt)
    {
        if (string.IsNullOrWhiteSpace(_apiKey))
            throw new InvalidOperationException("AI API key is not configured. Set either OpenAI:ApiKey or VertexAI:ApiKey in appsettings.json.");

        var url = "https://openrouter.ai/api/v1/chat/completions";

        var requestBody = new
        {
            model = _modelId,
            messages = new[]
            {
                new { role = "system", content = "You are a data analyst assistant. Always respond with valid JSON only, no markdown formatting." },
                new { role = "user", content = prompt }
            },
            temperature = 0.3,
            max_tokens = 4096,
            response_format = new { type = "json_object" }
        };

        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        _httpClient.DefaultRequestHeaders.Clear();
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");

        var response = await _httpClient.PostAsync(url, content);
        var responseBody = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("OpenRouter API error: {StatusCode} - {Body}", response.StatusCode, responseBody);
            throw new Exception($"OpenRouter API returned {response.StatusCode}. Ensure your API key is valid.");
        }

        using var doc = JsonDocument.Parse(responseBody);
        var text = doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString();

        return text ?? throw new Exception("Empty response from OpenRouter API.");
    }

    // ---- AI Feature Implementations ----

    public async Task<List<RiskPredictionDto>> GetRiskPredictionsAsync()
    {
        var providers = await _context.Providers
            .Include(p => p.Scores)
            .Where(p => !p.IsDeleted && p.Scores.Any())
            .ToListAsync();

        if (!providers.Any()) return new List<RiskPredictionDto>();

        var dataContext = new StringBuilder();
        foreach (var p in providers)
        {
            var scores = p.Scores.OrderBy(s => s.EvaluationDate).ToList();
            var avg = scores.Average(s => s.Score);
            var recent = scores.TakeLast(3).Select(s => $"{s.Score:F2}").ToList();
            dataContext.AppendLine($"- ID:{p.Id}, Name:{p.Name}, Specialty:{p.Specialty}, Status:{p.Status}, AvgScore:{avg:F2}, RecentScores:[{string.Join(",", recent)}], TotalEvals:{scores.Count}");
        }

        var prompt = $@"You are a healthcare analytics AI. Analyze provider performance data and predict risk levels.

PROVIDER DATA:
{dataContext}

For each provider, predict:
- riskLevel: ""High"", ""Medium"", or ""Low""
- riskProbability: a percentage (0-100) representing likelihood of performance issues
- recommendation: specific actionable advice (1-2 sentences)
- riskFactors: array of specific risk factors identified (e.g., ""declining trend"", ""low scores"", ""high volatility"")

Consider: score averages, recent trends, score consistency, and current status.

Return a JSON array:
[{{""providerId"":1,""providerName"":""Name"",""riskLevel"":""High"",""riskProbability"":75.0,""recommendation"":""..."",""riskFactors"":[""...""]}}]";

        var geminiResponse = await CallGeminiAsync(prompt);
        var predictions = JsonSerializer.Deserialize<List<GeminiRiskPrediction>>(geminiResponse, JsonOptions)
            ?? new List<GeminiRiskPrediction>();

        return predictions.Select(p => new RiskPredictionDto(
            p.ProviderId, p.ProviderName ?? "", p.RiskLevel ?? "Low",
            p.RiskProbability, p.Recommendation ?? "", p.RiskFactors ?? new List<string>(),
            DateTime.UtcNow
        )).OrderByDescending(r => r.RiskProbability).ToList();
    }

    public async Task<RiskPredictionDto?> GetProviderRiskPredictionAsync(int providerId)
    {
        var provider = await _context.Providers
            .Include(p => p.Scores)
            .FirstOrDefaultAsync(p => p.Id == providerId && !p.IsDeleted);

        if (provider == null || !provider.Scores.Any()) return null;

        var scores = provider.Scores.OrderBy(s => s.EvaluationDate).ToList();
        var categoryData = scores.Where(s => s.Category != null)
            .GroupBy(s => s.Category!)
            .Select(g => $"{g.Key}:{g.Average(s => s.Score):F2}")
            .ToList();

        var prompt = $@"You are a healthcare analytics AI. Analyze this provider's performance and predict risk.

PROVIDER: {provider.Name} (ID:{provider.Id}), Specialty: {provider.Specialty}, Status: {provider.Status}
SCORES (chronological): [{string.Join(", ", scores.Select(s => $"{s.Score:F2} ({s.EvaluationDate:yyyy-MM-dd})"))}]
CATEGORY AVERAGES: {(categoryData.Any() ? string.Join(", ", categoryData) : "N/A")}
OVERALL AVERAGE: {scores.Average(s => s.Score):F2}

Predict:
- riskLevel: ""High"", ""Medium"", or ""Low""
- riskProbability: percentage (0-100)
- recommendation: actionable advice (2-3 sentences)
- riskFactors: array of identified risk factors

Return JSON:
{{""riskLevel"":""..."",""riskProbability"":0.0,""recommendation"":""..."",""riskFactors"":[""...""]}}";

        var geminiResponse = await CallGeminiAsync(prompt);
        var result = JsonSerializer.Deserialize<GeminiRiskPrediction>(geminiResponse, JsonOptions);

        if (result == null) return null;

        return new RiskPredictionDto(
            provider.Id, provider.Name, result.RiskLevel ?? "Low",
            result.RiskProbability, result.Recommendation ?? "",
            result.RiskFactors ?? new List<string>(), DateTime.UtcNow
        );
    }

    public async Task<PerformanceSummaryDto?> GetPerformanceSummaryAsync(int providerId)
    {
        var provider = await _context.Providers
            .Include(p => p.Scores)
            .FirstOrDefaultAsync(p => p.Id == providerId && !p.IsDeleted);

        if (provider == null || !provider.Scores.Any()) return null;

        var scores = provider.Scores.OrderBy(s => s.EvaluationDate).ToList();
        var categoryData = scores.Where(s => s.Category != null)
            .GroupBy(s => s.Category!)
            .Select(g => $"{g.Key}: avg {g.Average(s => s.Score):F2} ({g.Count()} evals)")
            .ToList();

        var monthlyTrends = scores
            .GroupBy(s => s.EvaluationDate.ToString("yyyy-MM"))
            .OrderBy(g => g.Key)
            .Select(g => $"{g.Key}: {g.Average(s => s.Score):F2}")
            .ToList();

        var prompt = $@"You are a healthcare analytics AI. Generate a performance summary for this provider.

PROVIDER: {provider.Name}, Specialty: {provider.Specialty}, Status: {provider.Status}, Location: {provider.Location ?? "N/A"}
OVERALL AVERAGE: {scores.Average(s => s.Score):F2}/5.00
TOTAL EVALUATIONS: {scores.Count}
MONTHLY TRENDS: {string.Join(", ", monthlyTrends)}
CATEGORY PERFORMANCE: {(categoryData.Any() ? string.Join("; ", categoryData) : "No category data")}
SCORE RANGE: {scores.Min(s => s.Score):F2} - {scores.Max(s => s.Score):F2}

Generate:
- summary: A professional 2-3 sentence performance summary
- strengths: Array of 2-4 specific strengths identified from the data
- areasForImprovement: Array of 1-3 specific areas needing improvement
- trendDirection: ""Improving"", ""Declining"", or ""Stable""

Return JSON:
{{""summary"":""..."",""strengths"":[""...""],""areasForImprovement"":[""...""],""trendDirection"":""...""}}";

        var geminiResponse = await CallGeminiAsync(prompt);
        var result = JsonSerializer.Deserialize<GeminiPerformanceSummary>(geminiResponse, JsonOptions);

        if (result == null) return null;

        return new PerformanceSummaryDto(
            provider.Id, provider.Name,
            result.Summary ?? "", result.Strengths ?? new List<string>(),
            result.AreasForImprovement ?? new List<string>(),
            result.TrendDirection ?? "Stable", DateTime.UtcNow
        );
    }

    public async Task<List<DashboardInsightDto>> GetDashboardInsightsAsync()
    {
        var providers = await _context.Providers
            .Include(p => p.Scores)
            .Where(p => !p.IsDeleted)
            .ToListAsync();

        var totalProviders = providers.Count;
        var activeCount = providers.Count(p => p.Status == "Active");
        var atRiskCount = providers.Count(p => p.Status == "At-Risk");
        var inactiveCount = providers.Count(p => p.Status == "Inactive");
        var allScores = providers.SelectMany(p => p.Scores).ToList();
        var overallAvg = allScores.Any() ? allScores.Average(s => s.Score) : 0m;

        var specialtyBreakdown = providers.GroupBy(p => p.Specialty)
            .Select(g => $"{g.Key}: {g.Count()} providers, avg {(g.SelectMany(p => p.Scores).Any() ? g.SelectMany(p => p.Scores).Average(s => s.Score) : 0):F2}")
            .ToList();

        var topProviders = providers.Where(p => p.Scores.Any())
            .OrderByDescending(p => p.Scores.Average(s => s.Score)).Take(3)
            .Select(p => $"{p.Name}: {p.Scores.Average(s => s.Score):F2}").ToList();

        var bottomProviders = providers.Where(p => p.Scores.Any())
            .OrderBy(p => p.Scores.Average(s => s.Score)).Take(3)
            .Select(p => $"{p.Name}: {p.Scores.Average(s => s.Score):F2}").ToList();

        var prompt = $@"You are a healthcare analytics AI. Generate actionable business insights for the dashboard.

ORGANIZATION DATA:
- Total Providers: {totalProviders} (Active: {activeCount}, At-Risk: {atRiskCount}, Inactive: {inactiveCount})
- Overall Average Score: {overallAvg:F2}/5.00
- Total Evaluations: {allScores.Count}
- Specialties: {string.Join("; ", specialtyBreakdown)}
- Top Performers: {string.Join("; ", topProviders)}
- Bottom Performers: {string.Join("; ", bottomProviders)}

Generate 4-6 actionable business insights. Each insight should have:
- insightType: one of ""Risk"", ""Trend"", ""Warning"", ""Achievement"", ""Action"", ""Summary""
- title: concise title (5-10 words)
- description: detailed insight with specific data points (2-3 sentences)
- severity: ""High"", ""Medium"", ""Low"", or ""Info""

Return JSON array:
[{{""insightType"":""..."",""title"":""..."",""description"":""..."",""severity"":""...""}}]";

        var geminiResponse = await CallGeminiAsync(prompt);
        var results = JsonSerializer.Deserialize<List<GeminiInsight>>(geminiResponse, JsonOptions)
            ?? new List<GeminiInsight>();

        return results.Select(r => new DashboardInsightDto(
            r.InsightType ?? "Summary", r.Title ?? "", r.Description ?? "",
            r.Severity ?? "Info", DateTime.UtcNow
        )).ToList();
    }

    public async Task<List<ErrorLogAnalysisDto>> GetErrorLogAnalysisAsync()
    {
        var errors = await _context.ErrorLogs
            .OrderByDescending(e => e.Timestamp)
            .Take(200)
            .ToListAsync();

        if (!errors.Any()) return new List<ErrorLogAnalysisDto>();

        var errorSummary = new StringBuilder();
        var groupedByStatus = errors.Where(e => e.StatusCode.HasValue)
            .GroupBy(e => e.StatusCode!.Value)
            .Select(g => $"HTTP {g.Key}: {g.Count()} occurrences");
        errorSummary.AppendLine($"Status Code Groups: {string.Join(", ", groupedByStatus)}");

        var groupedByPath = errors.Where(e => e.Path != null)
            .GroupBy(e => e.Path!).Where(g => g.Count() > 1)
            .Select(g => $"{g.Key}: {g.Count()} errors");
        errorSummary.AppendLine($"Affected Endpoints: {string.Join(", ", groupedByPath)}");

        var sampleErrors = errors.Take(20).Select(e =>
            $"[{e.Timestamp:yyyy-MM-dd HH:mm}] {e.Method} {e.Path} - HTTP {e.StatusCode}: {(e.Message.Length > 100 ? e.Message[..100] : e.Message)}"
        );
        errorSummary.AppendLine($"Recent Errors:\n{string.Join("\n", sampleErrors)}");

        var errorIdsByStatus = errors.Where(e => e.StatusCode.HasValue)
            .GroupBy(e => e.StatusCode!.Value)
            .ToDictionary(g => g.Key, g => g.Select(e => e.Id).ToList());

        var prompt = $@"You are a DevOps AI engineer. Analyze these application error logs and identify patterns.

ERROR LOG DATA:
{errorSummary}

For each pattern identified:
- pattern: descriptive pattern name (e.g., ""HTTP 500 Internal Server Errors"")
- occurrences: approximate count
- rootCause: technical root cause analysis (1-2 sentences)
- suggestion: specific actionable fix (1-2 sentences)
- severity: ""High"", ""Medium"", or ""Low""

Return JSON array:
[{{""pattern"":""..."",""occurrences"":5,""rootCause"":""..."",""suggestion"":""..."",""severity"":""...""}}]";

        var geminiResponse = await CallGeminiAsync(prompt);
        var results = JsonSerializer.Deserialize<List<GeminiErrorAnalysis>>(geminiResponse, JsonOptions)
            ?? new List<GeminiErrorAnalysis>();

        return results.Select(r =>
        {
            var affectedIds = new List<int>();
            foreach (var kvp in errorIdsByStatus)
            {
                if (r.Pattern != null && r.Pattern.Contains(kvp.Key.ToString()))
                    affectedIds.AddRange(kvp.Value);
            }
            if (!affectedIds.Any()) affectedIds = errors.Take(r.Occurrences).Select(e => e.Id).ToList();

            return new ErrorLogAnalysisDto(
                r.Pattern ?? "", r.Occurrences, r.RootCause ?? "",
                r.Suggestion ?? "", r.Severity ?? "Medium", affectedIds
            );
        }).ToList();
    }

    public async Task<AiAssistantResponseDto> AskAssistantAsync(string question)
    {
        var providers = await _context.Providers
            .Include(p => p.Scores)
            .Where(p => !p.IsDeleted)
            .ToListAsync();

        var totalProviders = providers.Count;
        var allScores = providers.SelectMany(p => p.Scores).ToList();
        var overallAvg = allScores.Any() ? allScores.Average(s => s.Score) : 0m;

        var providerSummary = providers.Where(p => p.Scores.Any())
            .Select(p => $"{p.Name} ({p.Specialty}, {p.Status}): avg {p.Scores.Average(s => s.Score):F2}, {p.Scores.Count} evals")
            .ToList();

        var statusBreakdown = $"Active: {providers.Count(p => p.Status == "Active")}, At-Risk: {providers.Count(p => p.Status == "At-Risk")}, Inactive: {providers.Count(p => p.Status == "Inactive")}";

        var prompt = $@"You are an AI assistant for a Provider Performance Analytics Dashboard. Answer the user's question using the data provided.

AVAILABLE DATA:
- Total Providers: {totalProviders} ({statusBreakdown})
- Overall Average Score: {overallAvg:F2}/5.00
- Total Evaluations: {allScores.Count}
- Providers: {string.Join("; ", providerSummary)}

USER QUESTION: {question}

Provide a clear, helpful answer using the data. Use markdown formatting for readability (bold for emphasis, bullet points for lists).

Return JSON:
{{""answer"":""your detailed answer here"",""questionType"":""category of question (e.g., RiskAnalysis, Performance, Summary, Count, Trend)""}}";

        var geminiResponse = await CallGeminiAsync(prompt);
        var result = JsonSerializer.Deserialize<GeminiAssistantResponse>(geminiResponse, JsonOptions);

        return new AiAssistantResponseDto(
            result?.Answer ?? "I couldn't generate a response. Please try again.",
            result?.QuestionType ?? "General",
            null, DateTime.UtcNow
        );
    }

    public async Task<List<AiRecommendationDto>> GetRecommendationsAsync(int providerId)
    {
        var provider = await _context.Providers
            .Include(p => p.Scores)
            .FirstOrDefaultAsync(p => p.Id == providerId && !p.IsDeleted);

        if (provider == null || !provider.Scores.Any())
            return new List<AiRecommendationDto>();

        var scores = provider.Scores.OrderBy(s => s.EvaluationDate).ToList();
        var categoryData = scores.Where(s => s.Category != null)
            .GroupBy(s => s.Category!)
            .Select(g => $"{g.Key}: {g.Average(s => s.Score):F2} ({g.Count()} evals)")
            .ToList();

        var lastEval = scores.Last().EvaluationDate;

        var prompt = $@"You are a healthcare performance improvement AI. Generate actionable recommendations for this provider.

PROVIDER: {provider.Name}, Specialty: {provider.Specialty}, Status: {provider.Status}
OVERALL AVERAGE: {scores.Average(s => s.Score):F2}/5.00
TOTAL EVALUATIONS: {scores.Count}
LAST EVALUATION: {lastEval:yyyy-MM-dd}
CATEGORY SCORES: {(categoryData.Any() ? string.Join("; ", categoryData) : "N/A")}
RECENT SCORES: [{string.Join(", ", scores.TakeLast(5).Select(s => $"{s.Score:F2}"))}]
SCORE RANGE: {scores.Min(s => s.Score):F2} - {scores.Max(s => s.Score):F2}

Generate 3-5 specific, actionable recommendations:
- action: what to do (concise, 1 sentence)
- reason: why it matters, backed by the data (1-2 sentences)
- priority: ""High"", ""Medium"", or ""Low""

Return JSON array:
[{{""action"":""..."",""reason"":""..."",""priority"":""...""}}]";

        var geminiResponse = await CallGeminiAsync(prompt);
        var results = JsonSerializer.Deserialize<List<GeminiRecommendation>>(geminiResponse, JsonOptions)
            ?? new List<GeminiRecommendation>();

        return results.Select(r => new AiRecommendationDto(
            provider.Id, provider.Name,
            r.Action ?? "", r.Reason ?? "", r.Priority ?? "Medium",
            DateTime.UtcNow
        )).ToList();
    }

    // ---- Gemini Response Models ----

    private class GeminiRiskPrediction
    {
        public int ProviderId { get; set; }
        public string? ProviderName { get; set; }
        public string? RiskLevel { get; set; }
        public decimal RiskProbability { get; set; }
        public string? Recommendation { get; set; }
        public List<string>? RiskFactors { get; set; }
    }

    private class GeminiPerformanceSummary
    {
        public string? Summary { get; set; }
        public List<string>? Strengths { get; set; }
        public List<string>? AreasForImprovement { get; set; }
        public string? TrendDirection { get; set; }
    }

    private class GeminiInsight
    {
        public string? InsightType { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Severity { get; set; }
    }

    private class GeminiErrorAnalysis
    {
        public string? Pattern { get; set; }
        public int Occurrences { get; set; }
        public string? RootCause { get; set; }
        public string? Suggestion { get; set; }
        public string? Severity { get; set; }
    }

    private class GeminiAssistantResponse
    {
        public string? Answer { get; set; }
        public string? QuestionType { get; set; }
    }

    private class GeminiRecommendation
    {
        public string? Action { get; set; }
        public string? Reason { get; set; }
        public string? Priority { get; set; }
    }
}
