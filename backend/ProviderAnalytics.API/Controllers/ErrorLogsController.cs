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
public class ErrorLogsController : ControllerBase
{
    private readonly IErrorLogService _errorLogService;

    public ErrorLogsController(IErrorLogService errorLogService)
    {
        _errorLogService = errorLogService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<ErrorLogDto>>), 200)]
    public async Task<IActionResult> GetErrorLogs()
    {
        var result = await _errorLogService.GetErrorLogsAsync();
        return Ok(new ApiResponse<IEnumerable<ErrorLogDto>>(true, "Error logs retrieved", result));
    }
}
