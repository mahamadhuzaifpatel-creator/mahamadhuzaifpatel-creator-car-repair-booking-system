import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import "./Auth.css";

import { useAuth } from "../context/AuthContext";
import { signInAdmin } from "../services/authService";

// Admin sign-in. Customers never need to sign in.
function Login() {
  const { loading, profile } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Already signed in (or just signed in) as an admin: open the admin panel.
  if (!loading && profile?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      await signInAdmin(email.trim(), password);
      // No navigate() here: once the sign-in is picked up by AuthContext,
      // the check above redirects automatically.
    } catch (err) {
      console.error("Failed to sign in:", err);
      setError(err.message || "Unable to sign in.");
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="auth-label">CARCARE ADMIN PANEL</p>

        <h1>Admin sign in</h1>

        <p className="auth-subtitle">
          Use your admin account to manage centers, services and bookings.
        </p>

        {error && <p className="form-error">{error}</p>}

        <div className="form-field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <button type="submit" className="primary-btn" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign in"}
        </button>

        <p className="auth-footer">
          Here to book a repair? <Link to="/book">Book without signing in</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
