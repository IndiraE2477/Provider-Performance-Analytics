using FluentValidation;
using ProviderAnalytics.API.DTOs;

namespace ProviderAnalytics.API.Validators;

public class CreateProviderValidator : AbstractValidator<CreateProviderDto>
{
    public CreateProviderValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Provider name is required")
            .MaximumLength(200).WithMessage("Provider name must not exceed 200 characters");

        RuleFor(x => x.Specialty)
            .NotEmpty().WithMessage("Specialty is required")
            .MaximumLength(100).WithMessage("Specialty must not exceed 100 characters");

        RuleFor(x => x.Email)
            .EmailAddress().When(x => !string.IsNullOrEmpty(x.Email))
            .WithMessage("Invalid email address");

        RuleFor(x => x.Phone)
            .MaximumLength(20).WithMessage("Phone must not exceed 20 characters");

        RuleFor(x => x.Location)
            .MaximumLength(200).WithMessage("Location must not exceed 200 characters");
    }
}

public class UpdateProviderValidator : AbstractValidator<UpdateProviderDto>
{
    private static readonly string[] ValidStatuses = { "Active", "Inactive", "At-Risk" };

    public UpdateProviderValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Provider name is required")
            .MaximumLength(200).WithMessage("Provider name must not exceed 200 characters");

        RuleFor(x => x.Specialty)
            .NotEmpty().WithMessage("Specialty is required")
            .MaximumLength(100).WithMessage("Specialty must not exceed 100 characters");

        RuleFor(x => x.Email)
            .EmailAddress().When(x => !string.IsNullOrEmpty(x.Email))
            .WithMessage("Invalid email address");

        RuleFor(x => x.Phone)
            .MaximumLength(20).WithMessage("Phone must not exceed 20 characters");

        RuleFor(x => x.Location)
            .MaximumLength(200).WithMessage("Location must not exceed 200 characters");

        RuleFor(x => x.Status)
            .NotEmpty().WithMessage("Status is required")
            .Must(s => ValidStatuses.Contains(s))
            .WithMessage("Status must be Active, Inactive, or At-Risk");
    }
}
