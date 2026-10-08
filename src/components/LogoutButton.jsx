import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { signOut } from "../services/authService";

function LogoutButton({ className = "logout-btn" }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    setBusy(true);

    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Failed to log out:", err);
      alert("Could not log out. Please try again.");
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      className={className}
      onClick={handleLogout}
      disabled={busy}
    >
      Logout
    </button>
  );
}

export default LogoutButton;
