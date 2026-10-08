import { Outlet } from "react-router-dom";
import "./DashboardLayout.css";

import Sidebar from "./Sidebar";

// The frame around every admin page: sidebar on the left, page on the right.
function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main">
        <Outlet />
      </div>
    </div>
  );
}

export default DashboardLayout;
