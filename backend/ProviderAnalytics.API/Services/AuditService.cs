using System.Text.Json;
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
}
