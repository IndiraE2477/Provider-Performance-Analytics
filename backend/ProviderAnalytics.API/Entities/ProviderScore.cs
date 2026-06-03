namespace ProviderAnalytics.API.Entities;

public class ProviderScore
{
    public int Id { get; set; }
    public int ProviderId { get; set; }
    public decimal Score { get; set; }
    public string? Category { get; set; }
    public string? Notes { get; set; }
    public DateTime EvaluationDate { get; set; } = DateTime.UtcNow;
    public string? EvaluatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Provider Provider { get; set; } = null!;
}
