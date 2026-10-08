import { useState } from "react";

import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import StatusBadge from "../../components/StatusBadge";
import BookingStatusForm from "../../components/BookingStatusForm";

import { useAsync } from "../../hooks/useAsync";
import { getBookings, updateBooking } from "../../services/adminService";
import { BOOKING_STATUSES } from "../../lib/constants";
import {
  formatCurrency,
  formatDate,
  formatTime,
  vehicleLabel,
} from "../../lib/format";

function Bookings() {
  const {
    data: bookings,
    setData: setBookings,
    loading,
    error,
    reload,
  } = useAsync(getBookings);

  const [statusFilter, setStatusFilter] = useState("all");
  const [editingBooking, setEditingBooking] = useState(null);

  function openManageForm(booking) {
    setEditingBooking(booking);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSave(values) {
    const updated = await updateBooking(editingBooking.id, values);

    setBookings((current) =>
      current.map((booking) => (booking.id === updated.id ? updated : booking))
    );

    setEditingBooking(null);
  }

  const visibleBookings =
    statusFilter === "all"
      ? bookings ?? []
      : (bookings ?? []).filter((booking) => booking.status === statusFilter);

  return (
    <div>
      <PageHeader
        label="Admin Management"
        title="Bookings"
        subtitle="Monitor all customer repair bookings and update their status."
      >
        <label htmlFor="status-filter" className="cell-sub">
          Show
        </label>

        <select
          id="status-filter"
          className="filter-select"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="all">All bookings</option>

          {BOOKING_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </PageHeader>

      <main className="page-content">
        {loading && <LoadingSpinner />}

        {!loading && error && <ErrorMessage message={error} onRetry={reload} />}

        {!loading && !error && bookings && (
          <>
            {editingBooking && (
              <div className="section-card">
                <BookingStatusForm
                  key={editingBooking.id}
                  booking={editingBooking}
                  onSave={handleSave}
                  onCancel={() => setEditingBooking(null)}
                />
              </div>
            )}

            <div className="section-card">
              {bookings.length === 0 && (
                <EmptyState
                  title="No bookings found"
                  message="Bookings will appear here once customers create them."
                />
              )}

              {bookings.length > 0 && visibleBookings.length === 0 && (
                <EmptyState
                  title={`No ${statusFilter} bookings`}
                  message="Choose a different status in the filter above."
                />
              )}

              {visibleBookings.length > 0 && (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Customer</th>
                        <th>Vehicle</th>
                        <th>Service</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Cost</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {visibleBookings.map((booking) => (
                        <tr key={booking.id}>
                          <td>#{booking.id}</td>
                          <td>
                            {booking.customer?.full_name || "—"}
                            <span className="cell-sub">
                              {booking.customer?.phone ?? ""}
                            </span>
                          </td>
                          <td>{vehicleLabel(booking.vehicle)}</td>
                          <td>
                            {booking.service?.name ?? "—"}
                            <span className="cell-sub">
                              {booking.service_center?.name ?? "—"}
                            </span>
                          </td>
                          <td className="nowrap">
                            {formatDate(booking.booking_date)}
                            <span className="cell-sub">
                              {formatTime(booking.booking_time)}
                            </span>
                          </td>
                          <td>
                            <StatusBadge status={booking.status} />
                          </td>
                          <td className="nowrap">
                            {formatCurrency(
                              booking.final_cost ?? booking.estimated_cost
                            )}
                            <span className="cell-sub">
                              {booking.final_cost === null ||
                              booking.final_cost === undefined
                                ? "estimate"
                                : "final"}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="link-btn"
                              onClick={() => openManageForm(booking)}
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Bookings;
