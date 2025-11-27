import React, { useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';

function LoginPage({ onForgotPassword }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const API_URL = 'http://localhost:5000/api/auth/login';
      const response = await axios.post(API_URL, { email, password });

      // Extract token and user
      const { token, user } = response.data;

      if (!token || !user) {
        setError('Invalid login response from server.');
        setLoading(false);
        return;
      }

      const role = user.role;
      const userId = user.user_id;

      // Store data
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));

      setSuccess('Login successful! Redirecting...');
      setEmail('');
      setPassword('');

      // Redirect based on role
      if (role === 'volunteer') {
        if (!userId) {
          setError('User ID missing from backend.');
          setLoading(false);
          return;
        }
        navigate(`/volunteer/${userId}/dashboard`);
      } 
      else if (role === 'parent') {
        navigate('/parent/dashboard');
      }
      else if (role === 'admin') {
        navigate('/admin');
      } 
      else {
        navigate('/');
      }

    } catch (err) {
      console.error('Login Error:', err);
      if (err.response) {
        setError(err.response.data.message || 'Invalid email or password.');
      } else if (err.request) {
        setError('Cannot connect to the server.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>

      <form className="login-form" onSubmit={handleSubmit}>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Logging In...' : 'Log In'}
        </button>

        <p className="forgot-password">
          <a
            href="#"
            className="link-btn"
            onClick={(e) => {
              e.preventDefault();
              if (onForgotPassword) onForgotPassword();
            }}
          >
            Forgot Password?
          </a>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;
