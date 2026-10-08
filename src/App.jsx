import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "./components/DashboardLayout";

import Dashboard from "./pages/admin/Dashboard";
import Customers from "./pages/admin/Customers";
import ServiceCenters from "./pages/admin/ServiceCenters";
import Bookings from "./pages/admin/Bookings";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default route */}
        <Route
          path="/"
          element={<Navigate to="/admin" replace />}
        />

        {/* Admin routes */}
        <Route path="/admin" element={<DashboardLayout />}>

          <Route index element={<Dashboard />} />

          <Route
            path="customers"
            element={<Customers />}
          />

          <Route
            path="service-centers"
            element={<ServiceCenters />}
          />

          <Route
            path="bookings"
            element={<Bookings />}
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;