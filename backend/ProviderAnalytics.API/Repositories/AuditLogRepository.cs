using Microsoft.EntityFrameworkCore;
using ProviderAnalytics.API.Data;
using ProviderAnalytics.API.Entities;
using ProviderAnalytics.API.Repositories.Interfaces;

namespace ProviderAnalytics.API.Repositories;

public class AuditLogRepository : GenericRepository<AuditLog>, IAuditLogRepository
{
    public AuditLogRepository(ApplicationDbContext context) : base(context) { }

    public async Task<IEnumerable<AuditLog>> GetByEntityAsync(string entityName, int entityId)
        => await _dbSet
            .Where(a => a.EntityName == entityName && a.EntityId == entityId)
            .OrderByDescending(a => a.Timestamp)
            .ToListAsync();
}
