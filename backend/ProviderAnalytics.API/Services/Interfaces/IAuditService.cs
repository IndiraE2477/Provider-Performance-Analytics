using ProviderAnalytics.API.DTOs;
using ProviderAnalytics.API.Entities;

namespace ProviderAnalytics.API.Services.Interfaces;

public interface IAuditService
{
    Task LogAsync(string entityName, int entityId, string actionType, string? oldValues, string? newValues, string? modifiedBy);
    Task<PagedResult<AuditLogDto>> GetAuditLogsPagedAsync(AuditLogQueryParams queryParams);
}
