import { useEffect, useState } from "react";
import "./AdminTable.css";

import EmptyState from "../../components/EmptyState";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";

import { getBookings } from "../../services/adminService";
import { formatDate, formatTime, formatCurrency } from "../../lib/format";

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBookings() {
      try {
        const data = await getBookings();
        setBookings(data);
      } catch (err) {
        console.error("Failed to load bookings:", err);
        setError(err.message || "Unable to load bookings.");
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, []);

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <p className="admin-label">ADMIN MANAGEMENT</p>

          <h1>Bookings</h1>

          <p className="admin-subtitle">
            Monitor all customer repair bookings.
          </p>
        </div>
      </header>

      <main className="admin-content">
        {loading && <LoadingSpinner />}

        {!loading && error && <ErrorMessage message={error} />}

        {!loading && !error && (
          <div className="dashboard-section">
            {bookings.length === 0 ? (
              <EmptyState
                title="No bookings found"
                message="Bookings will appear here once customers create them."
              />
            ) : (
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Customer</th>
                      <th>Vehicle</th>
                      <th>Service Center</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Cost</th>
                    </tr>
                  </thead>

                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td>#{booking.id}</td>
                        <td>{booking.customer?.full_name ?? "—"}</td>
                        <td>
                          {booking.vehicle
                            ? `${booking.vehicle.brand} ${booking.vehicle.model} (${booking.vehicle.registration_number})`
                            : "—"}
                        </td>
                        <td>{booking.service_center?.name ?? "—"}</td>
                        <td>{formatDate(booking.booking_date)}</td>
                        <td>{formatTime(booking.booking_time)}</td>
                        <td>
                          <span
                            className={`status-badge status-${(
                              booking.status ?? "unknown"
                            ).toLowerCase()}`}
                          >
                            {booking.status ?? "—"}
                          </span>
                        </td>
                        <td>
                          {formatCurrency(
                            booking.final_cost ?? booking.estimated_cost
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Bookings;