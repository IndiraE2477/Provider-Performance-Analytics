namespace ProviderAnalytics.API.DTOs;

public record ErrorLogDto(
    int Id,
    string Message,
    string? StackTrace,
    string? Source,
    string? Path,
    string? Method,
    int? StatusCode,
    DateTime Timestamp
);
