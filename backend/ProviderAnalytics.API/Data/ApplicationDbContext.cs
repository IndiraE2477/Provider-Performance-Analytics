using Microsoft.EntityFrameworkCore;
using ProviderAnalytics.API.Entities;

namespace ProviderAnalytics.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Provider> Providers => Set<Provider>();
    public DbSet<ProviderScore> ProviderScores => Set<ProviderScore>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<ErrorLog> ErrorLogs => Set<ErrorLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(r => r.Id);
            entity.Property(r => r.Name).HasMaxLength(50).IsRequired();
            entity.HasIndex(r => r.Name).IsUnique();
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Username).HasMaxLength(100).IsRequired();
            entity.Property(u => u.Email).HasMaxLength(200).IsRequired();
            entity.Property(u => u.PasswordHash).IsRequired();
            entity.Property(u => u.FullName).HasMaxLength(200).IsRequired();
            entity.HasIndex(u => u.Username).IsUnique();
            entity.HasIndex(u => u.Email).IsUnique();

            entity.HasOne(u => u.Role)
                  .WithMany(r => r.Users)
                  .HasForeignKey(u => u.RoleId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(u => u.Provider)
                  .WithMany()
                  .HasForeignKey(u => u.ProviderId)
                  .IsRequired(false)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Provider>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Name).HasMaxLength(200).IsRequired();
            entity.Property(p => p.Specialty).HasMaxLength(100).IsRequired();
            entity.Property(p => p.Email).HasMaxLength(200);
            entity.Property(p => p.Phone).HasMaxLength(20);
            entity.Property(p => p.Location).HasMaxLength(200);
            entity.Property(p => p.Status).HasMaxLength(20).HasDefaultValue("Active");
            entity.HasIndex(p => p.Name).IsUnique().HasFilter("[IsDeleted] = 0");
            entity.HasQueryFilter(p => !p.IsDeleted);
        });

        modelBuilder.Entity<ProviderScore>(entity =>
        {
            entity.HasKey(ps => ps.Id);
            entity.Property(ps => ps.Score).HasPrecision(3, 2);
            entity.Property(ps => ps.Category).HasMaxLength(100);
            entity.Property(ps => ps.Notes).HasMaxLength(500);

            entity.HasOne(ps => ps.Provider)
                  .WithMany(p => p.Scores)
                  .HasForeignKey(ps => ps.ProviderId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(a => a.Id);
            entity.Property(a => a.EntityName).HasMaxLength(100).IsRequired();
            entity.Property(a => a.ActionType).HasMaxLength(50).IsRequired();
            entity.Property(a => a.ModifiedBy).HasMaxLength(100);
        });

        // ErrorLog configuration
        modelBuilder.Entity<ErrorLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Message).IsRequired();
            entity.Property(e => e.Source).HasMaxLength(200);
            entity.Property(e => e.Path).HasMaxLength(500);
            entity.Property(e => e.Method).HasMaxLength(10);
        });

        SeedData(modelBuilder);
    }

    private static void SeedData(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Role>().HasData(
            new Role { Id = 1, Name = "Admin", Description = "Full system access", CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Role { Id = 2, Name = "Manager", Description = "Can manage providers and view reports", CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Role { Id = 3, Name = "Viewer", Description = "Read-only access to dashboards", CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );

        // Password: Admin@123 (BCrypt hashed)
        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = 1,
                Username = "admin",
                Email = "admin@provideranalytics.com",
                PasswordHash = "$2a$11$Czhl.iZE3b9JcZG0K2Fq7elMyMxFLvZU2wkw1DGsDnztGTaFmkij.",
                FullName = "System Administrator",
                RoleId = 1,
                IsActive = true,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new User
            {
                Id = 2,
                Username = "manager",
                Email = "manager@provideranalytics.com",
                PasswordHash = "$2a$11$Czhl.iZE3b9JcZG0K2Fq7elMyMxFLvZU2wkw1DGsDnztGTaFmkij.",
                FullName = "Team Manager",
                RoleId = 2,
                IsActive = true,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new User
            {
                Id = 3,
                Username = "viewer",
                Email = "viewer@provideranalytics.com",
                PasswordHash = "$2a$11$Czhl.iZE3b9JcZG0K2Fq7elMyMxFLvZU2wkw1DGsDnztGTaFmkij.",
                FullName = "Dr. Sarah Johnson",
                RoleId = 3,
                ProviderId = 1,
                IsActive = true,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );

        var providers = new[]
        {
            new Provider { Id = 1, Name = "Dr. Sarah Johnson", Specialty = "Cardiology", Email = "sarah.johnson@health.com", Phone = "555-0101", Location = "New York", Status = "Active", CreatedAt = new DateTime(2026, 1, 15, 0, 0, 0, DateTimeKind.Utc), CreatedBy = "admin" },
            new Provider { Id = 2, Name = "Dr. Michael Chen", Specialty = "Neurology", Email = "michael.chen@health.com", Phone = "555-0102", Location = "Los Angeles", Status = "Active", CreatedAt = new DateTime(2026, 1, 20, 0, 0, 0, DateTimeKind.Utc), CreatedBy = "admin" },
            new Provider { Id = 3, Name = "Dr. Emily Davis", Specialty = "Pediatrics", Email = "emily.davis@health.com", Phone = "555-0103", Location = "Chicago", Status = "Active", CreatedAt = new DateTime(2026, 2, 1, 0, 0, 0, DateTimeKind.Utc), CreatedBy = "admin" },
            new Provider { Id = 4, Name = "Dr. James Wilson", Specialty = "Orthopedics", Email = "james.wilson@health.com", Phone = "555-0104", Location = "Houston", Status = "At-Risk", CreatedAt = new DateTime(2026, 2, 10, 0, 0, 0, DateTimeKind.Utc), CreatedBy = "admin" },
            new Provider { Id = 5, Name = "Dr. Lisa Anderson", Specialty = "Dermatology", Email = "lisa.anderson@health.com", Phone = "555-0105", Location = "Phoenix", Status = "Active", CreatedAt = new DateTime(2026, 2, 15, 0, 0, 0, DateTimeKind.Utc), CreatedBy = "admin" },
            new Provider { Id = 6, Name = "Dr. Robert Martinez", Specialty = "Oncology", Email = "robert.martinez@health.com", Phone = "555-0106", Location = "Philadelphia", Status = "At-Risk", CreatedAt = new DateTime(2026, 3, 1, 0, 0, 0, DateTimeKind.Utc), CreatedBy = "admin" },
            new Provider { Id = 7, Name = "Dr. Jennifer Taylor", Specialty = "Cardiology", Email = "jennifer.taylor@health.com", Phone = "555-0107", Location = "San Antonio", Status = "Active", CreatedAt = new DateTime(2026, 3, 5, 0, 0, 0, DateTimeKind.Utc), CreatedBy = "admin" },
            new Provider { Id = 8, Name = "Dr. David Brown", Specialty = "Neurology", Email = "david.brown@health.com", Phone = "555-0108", Location = "San Diego", Status = "Active", CreatedAt = new DateTime(2026, 3, 10, 0, 0, 0, DateTimeKind.Utc), CreatedBy = "admin" },
            new Provider { Id = 9, Name = "Dr. Amanda White", Specialty = "Pediatrics", Email = "amanda.white@health.com", Phone = "555-0109", Location = "Dallas", Status = "Inactive", CreatedAt = new DateTime(2026, 3, 15, 0, 0, 0, DateTimeKind.Utc), CreatedBy = "admin" },
            new Provider { Id = 10, Name = "Dr. Christopher Lee", Specialty = "Orthopedics", Email = "christopher.lee@health.com", Phone = "555-0110", Location = "San Jose", Status = "Active", CreatedAt = new DateTime(2026, 3, 20, 0, 0, 0, DateTimeKind.Utc), CreatedBy = "admin" }
        };
        modelBuilder.Entity<Provider>().HasData(providers);

        var scores = new List<ProviderScore>();
        var random = new Random(42);
        int scoreId = 1;
        string[] categories = { "Quality of Care", "Patient Satisfaction", "Efficiency", "Communication", "Compliance" };

        for (int providerId = 1; providerId <= 10; providerId++)
        {
            for (int month = 1; month <= 5; month++)
            {
                foreach (var category in categories)
                {
                    var baseScore = providerId switch
                    {
                        4 => 2.0m,  // At-Risk
                        6 => 1.8m,  // At-Risk
                        9 => 2.5m,  // Inactive
                        _ => 3.5m   // Active 
                    };
                    var score = Math.Round(baseScore + (decimal)(random.NextDouble() * 1.5), 2);
                    score = Math.Min(score, 5.0m);

                    scores.Add(new ProviderScore
                    {
                        Id = scoreId++,
                        ProviderId = providerId,
                        Score = score,
                        Category = category,
                        Notes = $"Monthly evaluation for {category}",
                        EvaluationDate = new DateTime(2026, month, 15, 0, 0, 0, DateTimeKind.Utc),
                        EvaluatedBy = "admin",
                        CreatedAt = new DateTime(2026, month, 15, 0, 0, 0, DateTimeKind.Utc)
                    });
                }
            }
        }
        modelBuilder.Entity<ProviderScore>().HasData(scores);
    }
}
