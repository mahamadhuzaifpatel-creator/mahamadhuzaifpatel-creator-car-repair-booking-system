import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import PublicLayout from "./components/PublicLayout";

import Home from "./pages/Home";
import BookService from "./pages/BookService";
import TrackBooking from "./pages/TrackBooking";
import Login from "./pages/Login";

import Dashboard from "./pages/admin/Dashboard";
import Customers from "./pages/admin/Customers";
import ServiceCenters from "./pages/admin/ServiceCenters";
import Services from "./pages/admin/Services";
import Bookings from "./pages/admin/Bookings";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public pages: anyone can open these, no sign-in needed */}
          <Route path="/" element={<Home />} />

          <Route element={<PublicLayout />}>
            <Route path="/book" element={<BookService />} />
            <Route path="/track" element={<TrackBooking />} />
          </Route>

          {/* Admin sign-in */}
          <Route path="/login" element={<Login />} />

          {/* Admin panel (admins only) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="customers" element={<Customers />} />
            <Route path="service-centers" element={<ServiceCenters />} />
            <Route path="services" element={<Services />} />
            <Route path="bookings" element={<Bookings />} />
          </Route>

          {/* Anything else goes back to the home page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
