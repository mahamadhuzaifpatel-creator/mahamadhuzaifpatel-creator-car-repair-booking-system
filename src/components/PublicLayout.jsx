import { Outlet } from "react-router-dom";
import "./PublicLayout.css";

import TopNav from "./TopNav";

// The frame around the public pages: navigation on top, page below.
function PublicLayout() {
  return (
    <div className="public-layout">
      <TopNav />

      <div className="public-body">
        <Outlet />
      </div>
    </div>
  );
}

export default PublicLayout;
