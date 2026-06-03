using Microsoft.EntityFrameworkCore;
using ProviderAnalytics.API.Data;
using ProviderAnalytics.API.DTOs;
using ProviderAnalytics.API.Entities;
using ProviderAnalytics.API.Repositories.Interfaces;

namespace ProviderAnalytics.API.Repositories;

public class ProviderRepository : GenericRepository<Provider>, IProviderRepository
{
    public ProviderRepository(ApplicationDbContext context) : base(context) { }

    public async Task<PagedResult<Provider>> GetPagedAsync(ProviderQueryParams queryParams)
    {
        var query = _dbSet.Include(p => p.Scores).AsQueryable();

        // Search filter
        if (!string.IsNullOrWhiteSpace(queryParams.Search))
        {
            var search = queryParams.Search.ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(search) ||
                p.Specialty.ToLower().Contains(search) ||
                (p.Location != null && p.Location.ToLower().Contains(search)));
        }

        // Specialty filter
        if (!string.IsNullOrWhiteSpace(queryParams.Specialty))
            query = query.Where(p => p.Specialty == queryParams.Specialty);

        // Status filter
        if (!string.IsNullOrWhiteSpace(queryParams.Status))
            query = query.Where(p => p.Status == queryParams.Status);

        // Sorting
        query = queryParams.SortBy?.ToLower() switch
        {
            "name" => queryParams.SortOrder == "desc" ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name),
            "specialty" => queryParams.SortOrder == "desc" ? query.OrderByDescending(p => p.Specialty) : query.OrderBy(p => p.Specialty),
            "status" => queryParams.SortOrder == "desc" ? query.OrderByDescending(p => p.Status) : query.OrderBy(p => p.Status),
            "score" => queryParams.SortOrder == "desc"
                ? query.OrderByDescending(p => p.Scores.Any() ? p.Scores.Average(s => s.Score) : 0)
                : query.OrderBy(p => p.Scores.Any() ? p.Scores.Average(s => s.Score) : 0),
            "createdat" => queryParams.SortOrder == "desc" ? query.OrderByDescending(p => p.CreatedAt) : query.OrderBy(p => p.CreatedAt),
            _ => query.OrderBy(p => p.Name)
        };

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((queryParams.Page - 1) * queryParams.PageSize)
            .Take(queryParams.PageSize)
            .ToListAsync();

        return new PagedResult<Provider>
        {
            Items = items,
            TotalCount = totalCount,
            Page = queryParams.Page,
            PageSize = queryParams.PageSize
        };
    }

    public async Task<Provider?> GetWithScoresAsync(int id)
        => await _dbSet
            .Include(p => p.Scores)
            .FirstOrDefaultAsync(p => p.Id == id);

    public async Task<IEnumerable<Provider>> GetAllWithScoresAsync()
        => await _dbSet
            .Include(p => p.Scores)
            .ToListAsync();

    public async Task<bool> NameExistsAsync(string name, int? excludeId = null)
    {
        var query = _dbSet.Where(p => p.Name == name);
        if (excludeId.HasValue)
            query = query.Where(p => p.Id != excludeId.Value);
        return await query.AnyAsync();
    }
}
