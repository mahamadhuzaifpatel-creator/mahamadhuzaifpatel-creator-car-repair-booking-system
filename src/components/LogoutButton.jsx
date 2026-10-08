import { useNavigate } from "react-router-dom";

import { signOut } from "../services/authService";

function LogoutButton() {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Failed to log out:", err);
      alert("Could not log out. Please try again.");
    }
  }

  return (
    <button className="logout-btn" onClick={handleLogout}>
      Logout
    </button>
  );
}

export default LogoutButton;