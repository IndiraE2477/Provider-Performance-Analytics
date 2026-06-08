using ProviderAnalytics.API.DTOs;
using ProviderAnalytics.API.Entities;

namespace ProviderAnalytics.API.Repositories.Interfaces;

public interface IAuditLogRepository : IGenericRepository<AuditLog>
{
    Task<IEnumerable<AuditLog>> GetByEntityAsync(string entityName, int entityId);
    Task<PagedResult<AuditLog>> GetPagedAsync(AuditLogQueryParams queryParams);
}
