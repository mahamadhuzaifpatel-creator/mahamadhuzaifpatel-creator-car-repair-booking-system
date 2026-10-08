import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Public.css";

import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";

import { trackBooking, cancelGuestBooking } from "../services/bookingService";
import { formatCurrency, formatDate, formatTime } from "../lib/format";

const statusMessages = {
  pending: "Waiting for the service center to confirm your booking.",
  confirmed: "Your booking is confirmed. Bring your car in at the booked time.",
  completed: "The work on your car is finished.",
  cancelled: "This booking was cancelled.",
};

// Lets a customer look up a booking with the booking number and the
// phone number they used. No sign-in needed.
function TrackBooking() {
  const location = useLocation();

  // Filled in when the customer arrives from the booking confirmation.
  const preset = location.state ?? {};

  const [bookingId, setBookingId] = useState(
    preset.bookingId ? String(preset.bookingId) : ""
  );
  const [phone, setPhone] = useState(preset.phone ?? "");

  const [booking, setBooking] = useState(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [cancelling, setCancelling] = useState(false);

  async function search(idText, phoneText) {
    const id = Number(String(idText).replace("#", "").trim());

    setError("");
    setNotice("");
    setBooking(null);

    if (!Number.isInteger(id) || id <= 0) {
      setError("Enter your booking number, for example 12.");
      return;
    }

    setSearching(true);

    try {
      const found = await trackBooking(id, phoneText);

      if (!found) {
        setError(
          "No booking matches that number and phone. Check both and try again."
        );
      } else {
        setBooking(found);
      }
    } catch (err) {
      console.error("Failed to find booking:", err);
      setError(err.message || "Unable to look up the booking.");
    } finally {
      setSearching(false);
    }
  }

  // Coming straight from a new booking: look it up without asking again.
  useEffect(() => {
    if (preset.bookingId && preset.phone) {
      search(preset.bookingId, preset.phone);
    }
    // Only on first load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    search(bookingId, phone);
  }

  async function handleCancel() {
    const confirmed = window.confirm(
      `Cancel booking #${booking.id}? This cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");
    setCancelling(true);

    try {
      await cancelGuestBooking(booking.id, phone);

      setBooking((current) => ({ ...current, status: "cancelled" }));
      setNotice(`Booking #${booking.id} was cancelled.`);
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      setError(err.message || "Unable to cancel the booking.");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div>
      <PageHeader
        label="Booking"
        title="Track a Booking"
        subtitle="Enter your booking number and the phone number you booked with."
      />

      <main className="page-content">
        <div className="section-card">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="track-id">Booking number</label>
                <input
                  id="track-id"
                  value={bookingId}
                  onChange={(event) => setBookingId(event.target.value)}
                  inputMode="numeric"
                  placeholder="12"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="track-phone">Phone number</label>
                <input
                  id="track-phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  autoComplete="tel"
                  placeholder="9876543210"
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="primary-btn"
                disabled={searching}
              >
                {searching ? "Searching..." : "Find booking"}
              </button>
            </div>
          </form>
        </div>

        {error && <p className="form-error track-message">{error}</p>}

        {notice && <p className="form-success track-message">{notice}</p>}

        {booking && (
          <div className="section-card">
            <div className="track-header">
              <div>
                <h2>Booking #{booking.id}</h2>

                <p className="track-status-text">
                  {statusMessages[booking.status] ?? ""}
                </p>
              </div>

              <StatusBadge status={booking.status} />
            </div>

            <dl className="detail-grid">
              <div>
                <dt>Vehicle</dt>
                <dd>{booking.vehicle || "—"}</dd>
              </div>

              <div>
                <dt>Service</dt>
                <dd>{booking.service_name || "General repair"}</dd>
              </div>

              <div>
                <dt>When</dt>
                <dd>
                  {formatDate(booking.booking_date)}
                  <span className="cell-sub">
                    {formatTime(booking.booking_time)}
                  </span>
                </dd>
              </div>

              <div>
                <dt>
                  {booking.final_cost === null ? "Estimated cost" : "Final cost"}
                </dt>
                <dd>
                  {formatCurrency(booking.final_cost ?? booking.estimated_cost)}
                </dd>
              </div>

              <div className="detail-wide">
                <dt>Service center</dt>
                <dd>
                  {booking.service_center_name || "—"}
                  <span className="cell-sub">
                    {[booking.service_center_address, booking.service_center_phone]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </dd>
              </div>

              {booking.problem_description && (
                <div className="detail-wide">
                  <dt>Problem you described</dt>
                  <dd>{booking.problem_description}</dd>
                </div>
              )}
            </dl>

            {booking.status === "pending" && (
              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-btn danger-btn"
                  onClick={handleCancel}
                  disabled={cancelling}
                >
                  {cancelling ? "Cancelling..." : "Cancel this booking"}
                </button>
              </div>
            )}
          </div>
        )}

        <p className="track-footer">
          Need a repair? <Link to="/book">Book a service</Link>
        </p>
      </main>
    </div>
  );
}

export default TrackBooking;
