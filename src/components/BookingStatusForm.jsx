import { useState } from "react";

import { BOOKING_STATUSES } from "../lib/constants";
import {
  formatCurrency,
  formatDate,
  formatTime,
  vehicleLabel,
} from "../lib/format";

// Lets the admin change a booking's status and record the final cost.
function BookingStatusForm({ booking, onSave, onCancel }) {
  const [status, setStatus] = useState(booking.status ?? "pending");
  const [finalCost, setFinalCost] = useState(
    booking.final_cost === null || booking.final_cost === undefined
      ? ""
      : String(booking.final_cost)
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const cost = finalCost === "" ? null : Number(finalCost);

    if (cost !== null && (Number.isNaN(cost) || cost < 0)) {
      setError("Enter a final cost of 0 or more, or leave it empty.");
      return;
    }

    setSaving(true);

    try {
      await onSave({ status, final_cost: cost });
    } catch (err) {
      console.error("Failed to update booking:", err);
      setError(err.message || "Unable to update booking.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="form-title">Manage Booking #{booking.id}</h2>

      {error && <p className="form-error">{error}</p>}

      <dl className="detail-grid">
        <div>
          <dt>Customer</dt>
          <dd>
            {booking.customer?.full_name || "—"}
            {booking.customer?.phone && (
              <span className="cell-sub">{booking.customer.phone}</span>
            )}
          </dd>
        </div>

        <div>
          <dt>Vehicle</dt>
          <dd>{vehicleLabel(booking.vehicle)}</dd>
        </div>

        <div>
          <dt>Service</dt>
          <dd>
            {booking.service?.name ?? "—"}
            <span className="cell-sub">
              {booking.service_center?.name ?? "—"}
            </span>
          </dd>
        </div>

        <div>
          <dt>When</dt>
          <dd>
            {formatDate(booking.booking_date)}
            <span className="cell-sub">{formatTime(booking.booking_time)}</span>
          </dd>
        </div>

        <div>
          <dt>Estimated cost</dt>
          <dd>{formatCurrency(booking.estimated_cost)}</dd>
        </div>

        <div className="detail-wide">
          <dt>Problem described by customer</dt>
          <dd>{booking.problem_description || "—"}</dd>
        </div>
      </dl>

      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="booking-status">Status</label>
          <select
            id="booking-status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            {BOOKING_STATUSES.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="booking-final-cost">Final cost (₹)</label>
          <input
            id="booking-final-cost"
            type="number"
            min="0"
            step="1"
            value={finalCost}
            onChange={(event) => setFinalCost(event.target.value)}
            placeholder="Fill in when the work is done"
          />
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="secondary-btn"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </button>

        <button type="submit" className="primary-btn" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}

export default BookingStatusForm;
