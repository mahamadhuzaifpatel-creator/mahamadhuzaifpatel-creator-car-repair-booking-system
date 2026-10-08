import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="sidebar-brand">
        <h2>CarCare</h2>
        <span>Admin Panel</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/admin" end>
          Dashboard
        </NavLink>

        <NavLink to="/admin/customers">
          Customers
        </NavLink>

        <NavLink to="/admin/service-centers">
          Service Centers
        </NavLink>

        <NavLink to="/admin/bookings">
          Bookings
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <p>Car Repair Booking System</p>
      </div>
    </aside>
  );
}

export default Sidebar;