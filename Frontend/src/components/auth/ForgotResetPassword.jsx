import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ForgotResetPassword.css";

function ForgotResetPassword({ closeModal }) {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // 1 = forgot, 2 = reset
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage("");
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const API_URL = "http://localhost:5000/api/auth/forgot-password";
      const res = await axios.post(API_URL, { email });
      setMessage(res.data.message || "Reset token sent. Check your email.");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const API_URL = "http://localhost:5000/api/auth/reset-password";
      const res = await axios.post(API_URL, { token, newPassword });
      setMessage(res.data.message || "Password reset successful!");
      setTimeout(() => {
        if (closeModal) closeModal();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-reset-container">
      {step === 1 && (
        <form onSubmit={handleForgotPassword} className="forgot-form">
          <h2>Forgot Password</h2>
          {message && <p className="success">{message}</p>}
          {error && <p className="error">{error}</p>}
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading || step === 2}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Token"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleResetPassword} className="reset-form">
          <h2>Reset Password</h2>
          {message && <p className="success">{message}</p>}
          {error && <p className="error">{error}</p>}

          <input
            type="text"
            placeholder="Enter reset token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            disabled={loading}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          <p
            className="link-back"
            onClick={() => {
              setStep(1);
              setMessage("");
              setError("");
            }}
          >
            Back to Forgot Password
          </p>
        </form>
      )}
    </div>
  );
}

export default ForgotResetPassword;
