using Microsoft.EntityFrameworkCore;
using ProviderAnalytics.API.Data;
using ProviderAnalytics.API.DTOs;
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

    public async Task<PagedResult<AuditLog>> GetPagedAsync(AuditLogQueryParams queryParams)
    {
        var query = _dbSet.AsQueryable();

        if (!string.IsNullOrWhiteSpace(queryParams.Search))
        {
            var search = queryParams.Search.ToLower();
            query = query.Where(a =>
                a.EntityName.ToLower().Contains(search) ||
                (a.ModifiedBy != null && a.ModifiedBy.ToLower().Contains(search)));
        }

        if (!string.IsNullOrWhiteSpace(queryParams.ActionType))
            query = query.Where(a => a.ActionType == queryParams.ActionType);

        if (!string.IsNullOrWhiteSpace(queryParams.EntityName))
            query = query.Where(a => a.EntityName == queryParams.EntityName);

        query = queryParams.SortBy?.ToLower() switch
        {
            "actiontype" => queryParams.SortOrder == "desc" ? query.OrderByDescending(a => a.ActionType) : query.OrderBy(a => a.ActionType),
            "entityname" => queryParams.SortOrder == "desc" ? query.OrderByDescending(a => a.EntityName) : query.OrderBy(a => a.EntityName),
            "modifiedby" => queryParams.SortOrder == "desc" ? query.OrderByDescending(a => a.ModifiedBy) : query.OrderBy(a => a.ModifiedBy),
            "entityid" => queryParams.SortOrder == "desc" ? query.OrderByDescending(a => a.EntityId) : query.OrderBy(a => a.EntityId),
            _ => queryParams.SortOrder == "asc" ? query.OrderBy(a => a.Timestamp) : query.OrderByDescending(a => a.Timestamp)
        };

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((queryParams.Page - 1) * queryParams.PageSize)
            .Take(queryParams.PageSize)
            .ToListAsync();

        return new PagedResult<AuditLog>
        {
            Items = items,
            TotalCount = totalCount,
            Page = queryParams.Page,
            PageSize = queryParams.PageSize
        };
    }
}
