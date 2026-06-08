using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProviderAnalytics.API.DTOs;
using ProviderAnalytics.API.Services.Interfaces;

namespace ProviderAnalytics.API.Controllers;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")]
public class AuditLogsController : ControllerBase
{
    private readonly IAuditService _auditService;

    public AuditLogsController(IAuditService auditService)
    {
        _auditService = auditService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<AuditLogDto>>), 200)]
    public async Task<IActionResult> GetAuditLogs([FromQuery] AuditLogQueryParams queryParams)
    {
        var result = await _auditService.GetAuditLogsPagedAsync(queryParams);
        return Ok(new ApiResponse<PagedResult<AuditLogDto>>(true, "Audit logs retrieved", result));
    }
}
