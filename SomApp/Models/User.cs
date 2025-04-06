using System;

namespace SomApp.Models
{
    public class User
    {
        public int Id { get; set; }
        public required string Username { get; set; }
        public required string Email { get; set; }
        public required string PasswordHash { get; set; }
        public required DateTime CreatedAt { get; set; }
    }

    public class UserLoginDto
    {
        public required string Username { get; set; }
        public required string Password { get; set; }
    }

    public class UserRegisterDto
    {
        public required string Username { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
    }
}