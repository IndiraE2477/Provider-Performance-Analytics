namespace ProviderAnalytics.API.Entities;

public class AuditLog
{
    public int Id { get; set; }
    public string EntityName { get; set; } = string.Empty;
    public string ActionType { get; set; } = string.Empty;
    public int EntityId { get; set; }
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public string? ModifiedBy { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
