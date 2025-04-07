import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postsApi } from '../services/api';
import { Post } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await postsApi.getPosts();
        setPosts(response.data);
      } catch (err) {
        setError('Failed to fetch posts. Please try again later.');
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return <div className="loading">Loading posts...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="home-container">
      <div className="posts-header">
        <h2>Recent Posts</h2>
        {isAuthenticated && (
          <Link to="/posts/new" className="new-post-button">
            Create New Post
          </Link>
        )}
      </div>

      {posts.length === 0 ? (
        <p className="no-posts">No posts yet. Be the first to create one!</p>
      ) : (
        <div className="posts-list">
          {posts.map((post) => (
            <div key={post.id} className="post-card">
              <h3 className="post-title">
                <Link to={`/posts/${post.id}`}>{post.title}</Link>
              </h3>
              <div className="post-meta">
                <span className="post-author">By {post.author.username}</span>
                <span className="post-date">Posted on {formatDate(post.createdAt)}</span>
              </div>
              <p className="post-excerpt">
                {post.content.length > 150
                  ? `${post.content.substring(0, 150)}...`
                  : post.content}
              </p>
              <Link to={`/posts/${post.id}`} className="read-more">
                Read More
              </Link>
              {isAuthenticated && user?.id === post.author.id && (
                <div className="post-actions">
                  <Link to={`/posts/edit/${post.id}`} className="edit-link">
                    Edit
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;