import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

import { signInAdmin } from "../services/authService";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      await signInAdmin(email, password);
      navigate("/admin", { replace: true });
    } catch (err) {
      console.error("Failed to sign in:", err);
      setError(err.message || "Unable to sign in.");
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <p className="login-label">CARCARE ADMIN PANEL</p>

        <h1>Sign in</h1>

        <p className="login-subtitle">
          Use your admin account to continue.
        </p>

        {error && <p className="login-error">{error}</p>}

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />

        <button type="submit" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}

export default Login;