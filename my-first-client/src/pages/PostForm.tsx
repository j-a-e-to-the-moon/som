import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { postsApi } from '../services/api';
import { PostForm as PostFormType } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface PostFormProps {
  isEdit?: boolean;
}

const PostForm: React.FC<PostFormProps> = ({ isEdit = false }) => {
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<PostFormType>({
    title: '',
    content: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(isEdit);
  const [error, setError] = useState<string | null>(null);
  
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // If editing, fetch the post
    if (isEdit && id) {
      const fetchPost = async () => {
        try {
          const response = await postsApi.getPost(parseInt(id));
          setFormData({
            title: response.data.title,
            content: response.data.content,
          });
        } catch (err) {
          setError('Failed to fetch post for editing.');
          console.error('Error fetching post for edit:', err);
        } finally {
          setInitialLoading(false);
        }
      };
      
      fetchPost();
    }
  }, [isEdit, id, isAuthenticated, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isEdit && id) {
        await postsApi.updatePost(parseInt(id), formData);
        navigate(`/posts/${id}`);
      } else {
        const response = await postsApi.createPost(formData);
        navigate(`/posts/${response.data.id}`);
      }
    } catch (err) {
      setError('Failed to save post. Please try again.');
      console.error('Error saving post:', err);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="loading">Loading post data...</div>;
  }

  return (
    <div className="post-form-container">
      <h2>{isEdit ? 'Edit Post' : 'Create New Post'}</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Enter post title"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            placeholder="Write your post content here..."
            rows={10}
          />
        </div>
        
        <div className="form-actions">
          <Link to={isEdit && id ? `/posts/${id}` : '/'} className="cancel-button">
            Cancel
          </Link>
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Saving...' : isEdit ? 'Update Post' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;