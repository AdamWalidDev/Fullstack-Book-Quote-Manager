namespace RedRiverTest.Api.Models
{
	public class User
	{
		public int Id { get; set; }
		public string Username { get; set; } = string.Empty;
		// Never store plain-text passwords — only the hash.
		public string PasswordHash { get; set; } = string.Empty;
	}
}
