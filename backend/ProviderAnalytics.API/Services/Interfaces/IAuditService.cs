using ProviderAnalytics.API.Entities;

namespace ProviderAnalytics.API.Services.Interfaces;

public interface IAuditService
{
    Task LogAsync(string entityName, int entityId, string actionType, string? oldValues, string? newValues, string? modifiedBy);
}
