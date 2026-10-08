import { Link, NavLink } from "react-router-dom";
import "./TopNav.css";

import { useAuth } from "../context/AuthContext";

// The bar across the top of the public pages.
function TopNav() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";

  return (
    <nav className="topnav" aria-label="Main">
      <div className="topnav-inner">
        <Link to="/" className="topnav-brand">
          CarCare
        </Link>

        <div className="topnav-links">
          <NavLink to="/track" className="topnav-link">
            Track Booking
          </NavLink>

          <NavLink to={isAdmin ? "/admin" : "/login"} className="topnav-link">
            {isAdmin ? "Admin Panel" : "Admin"}
          </NavLink>

          <Link to="/book" className="topnav-cta">
            Book a Service
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default TopNav;
