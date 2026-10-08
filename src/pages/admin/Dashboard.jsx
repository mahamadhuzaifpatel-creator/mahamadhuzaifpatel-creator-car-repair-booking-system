import { useEffect, useState } from "react";
import "./Dashboard.css";

import StatCard from "../../components/StatCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";

import { getAdminStats } from "../../services/adminService";

function Dashboard() {
  const [stats, setStats] = useState({
    customers: 0,
    vehicles: 0,
    serviceCenters: 0,
    bookings: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        setError("");

        const data = await getAdminStats();

        setStats(data);
      } catch (err) {
        console.error(
          "Failed to load admin statistics:",
          err
        );

        setError(
          err.message ||
            "Unable to load dashboard statistics."
        );
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <p className="admin-label">
            CAR REPAIR BOOKING SYSTEM
          </p>

          <h1>Admin Dashboard</h1>

          <p className="admin-subtitle">
            Monitor customers, vehicles, service centers
            and bookings.
          </p>
        </div>

        <button className="logout-btn">
          Logout
        </button>
      </header>

      <main className="admin-content">

        {loading && <LoadingSpinner />}

        {!loading && error && (
          <ErrorMessage message={error} />
        )}

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

                  <p>
                    Latest booking activity in the
                    system.
                  </p>
                </div>
              </div>

              <div className="empty-state">
                <h3>No recent bookings</h3>

                <p>
                  Recent customer bookings will appear
                  here once bookings are created.
                </p>
              </div>

            </section>
          </>
        )}

      </main>
    </div>
  );
}

export default Dashboard;