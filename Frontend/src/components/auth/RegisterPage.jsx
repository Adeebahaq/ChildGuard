// src/components/RegisterPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import './RegisterPage.css'; 

function RegisterPage({ openPanel }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Only one state needed now
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const API_URL = 'http://localhost:5000/api/auth/register';
      const payload = { username: username.trim(), email: email.trim(), password, role };
      // eslint-disable-next-line no-unused-vars
      const response = await axios.post(API_URL, payload);

      setSuccess('Registration successful! Redirecting to login...');
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setRole('');

      setTimeout(() => { if (openPanel) openPanel('login'); }, 1000);
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || JSON.stringify(err.response.data));
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
    <div className="register-container">
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <div className="form-group">
          <label>Username:</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={loading} placeholder="Enter username" />
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} placeholder="Enter email" />
        </div>

        {/* --- Password Field (HAS EYE ICON) --- */}
        <div className="form-group password-group">
          <label>Password:</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter password"
            />
            <span className="password-toggle" onClick={() => setShowPassword(prev => !prev)}>
              {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
            </span>
          </div>
        </div>

        {/* --- Confirm Password Field (NO EYE ICON) --- */}
        <div className="form-group password-group">
          <label>Confirm Password:</label>
          <div className="password-wrapper">
            <input
              type="password" /* Always hidden */
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="Confirm password"
            />
            {/* Toggle span removed from here */}
          </div>
        </div>

        <div className="form-group">
          <label>Role:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} required disabled={loading}>
            <option value="">Select Role</option>
            <option value="parent">Parent</option>
            <option value="sponsor">Sponsor</option>
            <option value="volunteer">Volunteer</option>
            <option value="case_reporter">Case Reporter</option>
          </select>
        </div>

        <button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
      </form>
    </div>
  );
}

export default RegisterPage;