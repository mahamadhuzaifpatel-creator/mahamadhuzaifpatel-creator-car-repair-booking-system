import { NavLink } from "react-router-dom";
import "./Sidebar.css";

import LogoutButton from "./LogoutButton";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/customers", label: "Customers" },
  { to: "/admin/service-centers", label: "Service Centers" },
  { to: "/admin/services", label: "Services" },
  { to: "/admin/bookings", label: "Bookings" },
];

function Sidebar() {
  const { profile } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <p className="sidebar-title">CarCare</p>
        <p className="sidebar-subtitle">Admin Panel</p>
      </div>

      <nav className="sidebar-nav" aria-label="Admin">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p className="sidebar-user">
          {profile?.full_name || profile?.email || "Admin"}
        </p>

        <LogoutButton className="sidebar-logout" />
      </div>
    </aside>
  );
}

export default Sidebar;
