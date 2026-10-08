import { Link } from "react-router-dom";
import "./Dashboard.css";

import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";

import { useAsync } from "../../hooks/useAsync";
import { getAdminStats, getRecentBookings } from "../../services/adminService";
import { formatDate } from "../../lib/format";

async function loadDashboard() {
  const [stats, recentBookings] = await Promise.all([
    getAdminStats(),
    getRecentBookings(5),
  ]);

  return { stats, recentBookings };
}

function Dashboard() {
  const { data, loading, error, reload } = useAsync(loadDashboard);

  return (
    <div>
      <PageHeader
        label="Car Repair Booking System"
        title="Admin Dashboard"
        subtitle="Monitor customers, vehicles, service centers and bookings."
      />

      <main className="page-content">
        {loading && <LoadingSpinner />}

        {!loading && error && <ErrorMessage message={error} onRetry={reload} />}

        {!loading && !error && data && (
          <>
            <section className="stats-grid">
              <StatCard
                title="Total Customers"
                value={data.stats.customers}
                description="Customers who have booked"
              />

              <StatCard
                title="Total Vehicles"
                value={data.stats.vehicles}
                description="Vehicles on record"
              />

              <StatCard
                title="Service Centers"
                value={data.stats.serviceCenters}
                description="Available service centers"
              />

              <StatCard
                title="Total Bookings"
                value={data.stats.bookings}
                description="All booking records"
              />
            </section>

            <section className="section-card">
              <div className="section-header dashboard-section-header">
                <div>
                  <h2>Recent Bookings</h2>

                  <p>Latest booking activity in the system.</p>
                </div>

                {data.recentBookings.length > 0 && (
                  <Link to="/admin/bookings" className="secondary-btn">
                    View all
                  </Link>
                )}
              </div>

              {data.recentBookings.length === 0 ? (
                <EmptyState
                  title="No recent bookings"
                  message="Recent customer bookings will appear here once bookings are created."
                />
              ) : (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Customer</th>
                        <th>Service Center</th>
                        <th>Service</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.recentBookings.map((booking) => (
                        <tr key={booking.id}>
                          <td>#{booking.id}</td>
                          <td>{booking.customer?.full_name || "—"}</td>
                          <td>{booking.service_center?.name ?? "—"}</td>
                          <td>{booking.service?.name ?? "—"}</td>
                          <td className="nowrap">
                            {formatDate(booking.booking_date)}
                          </td>
                          <td>
                            <StatusBadge status={booking.status} />
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
