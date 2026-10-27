using Microsoft.AspNetCore.Identity;
using RedRiverTest.Api.Data;
using RedRiverTest.Api.Models;

namespace RedRiverTest.Api.Auth;

public interface IUserStore
{
	// Add a new user.
	bool TryRegister(string username, string password);
	// Check if username + password is correct.
	bool ValidateCredentials(string username, string password);
}

public sealed class DbUserStore : IUserStore
{
	// Users are stored in the database; passwords are hashed with
	// ASP.NET Core's PasswordHasher (PBKDF2 + salt), never stored as plain text.
	private readonly AppDbContext _db;
	private readonly IPasswordHasher<User> _hasher;

	public DbUserStore(AppDbContext db, IPasswordHasher<User> hasher)
	{
		_db = db;
		_hasher = hasher;
	}

	public bool TryRegister(string username, string password)
	{
		// Basic checks.
		if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
		{
			return false;
		}

		var name = username.Trim();
		if (_db.Users.Any(u => u.Username == name))
		{
			return false;
		}

		var user = new User { Username = name };
		user.PasswordHash = _hasher.HashPassword(user, password);
		_db.Users.Add(user);
		_db.SaveChanges();
		return true;
	}

	public bool ValidateCredentials(string username, string password)
	{
		// Basic checks.
		if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
		{
			return false;
		}

		var name = username.Trim();
		var user = _db.Users.FirstOrDefault(u => u.Username == name);
		if (user is null)
		{
			return false;
		}

		return _hasher.VerifyHashedPassword(user, user.PasswordHash, password)
			!= PasswordVerificationResult.Failed;
	}
}
