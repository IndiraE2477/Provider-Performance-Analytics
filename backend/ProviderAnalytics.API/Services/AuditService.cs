using System.Text.Json;
using ProviderAnalytics.API.DTOs;
using ProviderAnalytics.API.Entities;
using ProviderAnalytics.API.Repositories.Interfaces;
using ProviderAnalytics.API.Services.Interfaces;

namespace ProviderAnalytics.API.Services;

public class AuditService : IAuditService
{
    private readonly IAuditLogRepository _auditLogRepository;
    private readonly ILogger<AuditService> _logger;

    public AuditService(IAuditLogRepository auditLogRepository, ILogger<AuditService> logger)
    {
        _auditLogRepository = auditLogRepository;
        _logger = logger;
    }

    public async Task LogAsync(string entityName, int entityId, string actionType,
        string? oldValues, string? newValues, string? modifiedBy)
    {
        var auditLog = new AuditLog
        {
            EntityName = entityName,
            EntityId = entityId,
            ActionType = actionType,
            OldValues = oldValues,
            NewValues = newValues,
            ModifiedBy = modifiedBy,
            Timestamp = DateTime.UtcNow
        };

        await _auditLogRepository.AddAsync(auditLog);
        _logger.LogInformation(
            "Audit: {ActionType} on {EntityName} (ID: {EntityId}) by {ModifiedBy}",
            actionType, entityName, entityId, modifiedBy);
    }

    public async Task<PagedResult<AuditLogDto>> GetAuditLogsPagedAsync(AuditLogQueryParams queryParams)
    {
        var pagedResult = await _auditLogRepository.GetPagedAsync(queryParams);
        return new PagedResult<AuditLogDto>
        {
            Items = pagedResult.Items.Select(a => new AuditLogDto(
                a.Id,
                a.EntityName,
                a.ActionType,
                a.EntityId,
                a.ModifiedBy,
                a.Timestamp
            )).ToList(),
            TotalCount = pagedResult.TotalCount,
            Page = pagedResult.Page,
            PageSize = pagedResult.PageSize
        };
    }
}
