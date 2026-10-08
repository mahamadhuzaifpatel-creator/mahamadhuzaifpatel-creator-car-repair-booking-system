import { Navigate } from "react-router-dom";

import LoadingSpinner from "./LoadingSpinner";
import { useAuth } from "../context/AuthContext";

// Wraps the admin pages. Anyone who is not a signed-in admin
// is sent to the login page.
function ProtectedRoute({ children }) {
  const { loading, profile } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  if (profile?.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
