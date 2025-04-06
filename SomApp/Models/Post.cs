using System;

namespace SomApp.Models
{
    public class Post
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public required string Content { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class PostCreateDto
    {
        public required string Title { get; set; }
        public required string Content { get; set; }
    }

    public class PostUpdateDto
    {
        public required string Title { get; set; }
        public required string Content { get; set; }
    }
}