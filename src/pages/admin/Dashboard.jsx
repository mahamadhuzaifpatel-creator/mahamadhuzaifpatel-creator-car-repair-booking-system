import LogoutButton from "../../components/LogoutButton";
import { useEffect, useState } from "react";
import "./Dashboard.css";
import "./AdminTable.css";

import StatCard from "../../components/StatCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";

import {
  getAdminStats,
  getRecentBookings,
} from "../../services/adminService";
import { formatDate } from "../../lib/format";

function Dashboard() {
  const [stats, setStats] = useState({
    customers: 0,
    vehicles: 0,
    serviceCenters: 0,
    bookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [statsData, bookingsData] = await Promise.all([
          getAdminStats(),
          getRecentBookings(5),
        ]);

        setStats(statsData);
        setRecentBookings(bookingsData);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
        setError(err.message || "Unable to load dashboard.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <p className="admin-label">CAR REPAIR BOOKING SYSTEM</p>

          <h1>Admin Dashboard</h1>

          <p className="admin-subtitle">
            Monitor customers, vehicles, service centers and bookings.
          </p>
        </div>

        <LogoutButton />
      </header>

      <main className="admin-content">
        {loading && <LoadingSpinner />}

        {!loading && error && <ErrorMessage message={error} />}

        {!loading && !error && (
          <>
            <section className="stats-grid">
              <StatCard
                title="Total Customers"
                value={stats.customers}
                description="Registered customers"
              />

              <StatCard
                title="Total Vehicles"
                value={stats.vehicles}
                description="Registered vehicles"
              />

              <StatCard
                title="Service Centers"
                value={stats.serviceCenters}
                description="Available service centers"
              />

              <StatCard
                title="Total Bookings"
                value={stats.bookings}
                description="All booking records"
              />
            </section>

            <section className="dashboard-section">
              <div className="section-header">
                <div>
                  <h2>Recent Bookings</h2>

                  <p>Latest booking activity in the system.</p>
                </div>
              </div>

              {recentBookings.length === 0 ? (
                <div className="empty-state">
                  <h3>No recent bookings</h3>

                  <p>
                    Recent customer bookings will appear here once
                    bookings are created.
                  </p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Customer</th>
                        <th>Service Center</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {recentBookings.map((booking) => (
                        <tr key={booking.id}>
                          <td>#{booking.id}</td>
                          <td>{booking.customer?.full_name ?? "—"}</td>
                          <td>{booking.service_center?.name ?? "—"}</td>
                          <td>{formatDate(booking.booking_date)}</td>
                          <td>
                            <span
                              className={`status-badge status-${(
                                booking.status ?? "unknown"
                              ).toLowerCase()}`}
                            >
                              {booking.status ?? "—"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default Dashboard;