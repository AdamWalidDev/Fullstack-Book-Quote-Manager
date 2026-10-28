using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RedRiverTest.Api.Auth;
using Scalar.AspNetCore;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Render provides a PORT env var — tell Kestrel to listen on it.
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(port))
{
	builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// JWT settings (Issuer, Audience, SigningKey)
builder.Services.AddOptions<JwtOptions>()
	.Bind(builder.Configuration.GetSection(JwtOptions.SectionName))
	.Validate(o => !string.IsNullOrWhiteSpace(o.SigningKey), $"{JwtOptions.SectionName}:SigningKey is required")
	.ValidateOnStart();

var jwtOptions = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>() ?? new JwtOptions();
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SigningKey));

builder.Services
	.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
	.AddJwtBearer(options =>
	{
       // Check the token on each request.
		options.TokenValidationParameters = new TokenValidationParameters
		{
			ValidateIssuer = true,
			ValidIssuer = jwtOptions.Issuer,
			ValidateAudience = true,
			ValidAudience = jwtOptions.Audience,
			ValidateIssuerSigningKey = true,
			IssuerSigningKey = signingKey,
			ValidateLifetime = true,
			ClockSkew = TimeSpan.FromSeconds(30)
		};
	});

builder.Services.AddAuthorization();

// Users stored in the database (hashed passwords) + token creator.
builder.Services.AddScoped<IPasswordHasher<RedRiverTest.Api.Models.User>, PasswordHasher<RedRiverTest.Api.Models.User>>();
builder.Services.AddScoped<IUserStore, DbUserStore>();
builder.Services.AddSingleton<IJwtTokenService, JwtTokenService>();

// SQLite database for books, citations and users.
builder.Services.AddDbContext<RedRiverTest.Api.Data.AppDbContext>(options =>
	options.UseSqlite("Data Source=books.db"));

// Allowed frontend origins: everything in config (AllowedOrigins array, or a comma-separated
// AllowedOrigins__0 env var on Render) PLUS localhost for development. Merged, not replaced.
var allowedOrigins = (builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? Array.Empty<string>())
	.SelectMany(o => o.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
	.Select(o => o.TrimEnd('/'))
	.Append("http://localhost:4200")
	.Distinct(StringComparer.OrdinalIgnoreCase)
	.ToArray();

builder.Services.AddCors(options =>
{
	options.AddPolicy("AngularDev", policy =>
	{
		policy
			.WithOrigins(allowedOrigins)
			.AllowAnyHeader()
			.AllowAnyMethod();
	});
});

var app = builder.Build();
using (var scope = app.Services.CreateScope())
{
	var db = scope.ServiceProvider.GetRequiredService<RedRiverTest.Api.Data.AppDbContext>();
    db.Database.Migrate();
	if (!db.Books.Any())
	{
		// Seed a few books so the list is not empty.
		db.Books.AddRange(
			new RedRiverTest.Api.Models.Book { Title = "Clean Code", Author = "Robert C. Martin", PublishedDate = new DateTime(2008, 8, 1) },
			new RedRiverTest.Api.Models.Book { Title = "The Pragmatic Programmer", Author = "Andrew Hunt & David Thomas", PublishedDate = new DateTime(1999, 10, 20) },
			new RedRiverTest.Api.Models.Book { Title = "Refactoring", Author = "Martin Fowler", PublishedDate = new DateTime(1999, 7, 8) },
			new RedRiverTest.Api.Models.Book { Title = "Designing Data-Intensive Applications", Author = "Martin Kleppmann", PublishedDate = new DateTime(2017, 3, 16) }
		);
		db.SaveChanges();
	}

	// Demo account so visitors can try the app without registering.
	// Citations for it are created automatically on first visit (see CitationsController).
	scope.ServiceProvider.GetRequiredService<IUserStore>().TryRegister(DemoAccount.Username, DemoAccount.Password);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
	app.MapOpenApi();
 app.MapScalarApiReference(options =>
	{
		options.WithTitle("Quotebook API");
	});
}

app.Logger.LogInformation("CORS allowed origins: {Origins}", string.Join(", ", allowedOrigins));
app.UseCors("AngularDev");

// Only redirect to HTTPS in development; Render handles HTTPS at the load balancer.
if (app.Environment.IsDevelopment())
{
	app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

public static class DemoAccount
{
	public const string Username = "demo";
	public const string Password = "demo1234";
}
