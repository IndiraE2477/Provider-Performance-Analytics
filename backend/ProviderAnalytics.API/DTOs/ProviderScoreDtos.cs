namespace ProviderAnalytics.API.DTOs;

public class ProviderScoreDto
{
    public int Id { get; init; }
    public int ProviderId { get; init; }
    public string? ProviderName { get; init; }
    public decimal Score { get; init; }
    public string? Category { get; init; }
    public string? Notes { get; init; }
    public DateTime EvaluationDate { get; init; }
    public string? EvaluatedBy { get; init; }
}

public record CreateProviderScoreDto(
    int ProviderId,
    decimal Score,
    string? Category,
    string? Notes,
    DateTime? EvaluationDate
);

public record UpdateProviderScoreDto(
    decimal Score,
    string? Category,
    string? Notes
);
