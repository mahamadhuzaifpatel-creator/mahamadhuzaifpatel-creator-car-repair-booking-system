import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import LoadingSpinner from "./LoadingSpinner";
import { getAdminStatus } from "../services/authService";

function ProtectedRoute({ children }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let active = true;

    getAdminStatus()
      .then((isAdmin) => {
        if (active) setStatus(isAdmin ? "allowed" : "denied");
      })
      .catch((err) => {
        console.error("Failed to check admin access:", err);
        if (active) setStatus("denied");
      });

    return () => {
      active = false;
    };
  }, []);

  if (status === "checking") {
    return <LoadingSpinner />;
  }

  if (status === "denied") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;