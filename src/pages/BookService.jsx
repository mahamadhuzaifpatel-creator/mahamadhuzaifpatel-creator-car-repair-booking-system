import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Public.css";

import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

import { useAsync } from "../hooks/useAsync";
import {
  getBookingOptions,
  createGuestBooking,
} from "../services/bookingService";
import { FUEL_TYPES } from "../lib/constants";
import {
  formatCurrency,
  formatDate,
  formatTime,
  nowTime,
  todayISO,
  toTimeInput,
} from "../lib/format";

const emptyForm = {
  full_name: "",
  phone: "",
  email: "",
  registration_number: "",
  brand: "",
  model: "",
  year: "",
  fuel_type: "",
  service_center_id: "",
  service_id: "",
  booking_date: "",
  booking_time: "",
  problem_description: "",
};

const maxYear = new Date().getFullYear() + 1;

// Keeps only the digits and drops a leading +91 or 0, so "+91 98765 43210"
// and "09876543210" both become "9876543210".
function cleanPhone(value) {
  const digits = value.replace(/\D/g, "");

  return digits.length > 10 ? digits.slice(-10) : digits;
}

// The public booking page. Anyone can use it without signing in.
function BookService() {
  const navigate = useNavigate();

  const { data, loading, error, reload } = useAsync(getBookingOptions);

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Filled in after a booking is created, to show the confirmation.
  const [confirmation, setConfirmation] = useState(null);

  const today = todayISO();

  // The chosen service center and the services it offers.
  const center =
    data?.centers.find(
      (item) => String(item.id) === form.service_center_id
    ) ?? null;

  const centerServices = (data?.services ?? []).filter(
    (item) =>
      item.service_center_id === null ||
      String(item.service_center_id) === form.service_center_id
  );

  const service =
    centerServices.find((item) => String(item.id) === form.service_id) ?? null;

  const openingTime = toTimeInput(center?.opening_time);
  const closingTime = toTimeInput(center?.closing_time);

  // If the chosen center lists no services, the customer describes the problem instead.
  const mustDescribeProblem = Boolean(center) && centerServices.length === 0;

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
      // Services differ per center, so clear the service when the center changes.
      ...(name === "service_center_id" ? { service_id: "" } : {}),
    }));
  }

  function validate() {
    const phone = cleanPhone(form.phone);
    const year = form.year === "" ? null : Number(form.year);

    if (phone.length !== 10) {
      return "Enter a 10-digit phone number.";
    }

    if (year !== null && (!Number.isInteger(year) || year < 1950 || year > maxYear)) {
      return `Enter a year between 1950 and ${maxYear}.`;
    }

    if (form.booking_date < today) {
      return "Choose today or a later date.";
    }

    if (form.booking_date === today && form.booking_time <= nowTime()) {
      return "That time has already passed. Choose a later time.";
    }

    if (
      openingTime &&
      closingTime &&
      (form.booking_time < openingTime || form.booking_time > closingTime)
    ) {
      return `${center.name} is open from ${formatTime(openingTime)} to ${formatTime(closingTime)}. Choose a time in that range.`;
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const problem = validate();

    if (problem) {
      setFormError(problem);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setFormError("");
    setSaving(true);

    const phone = cleanPhone(form.phone);

    try {
      const bookingId = await createGuestBooking({
        fullName: form.full_name.trim(),
        phone,
        email: form.email.trim() || null,
        registrationNumber: form.registration_number.trim().toUpperCase(),
        brand: form.brand.trim(),
        model: form.model.trim(),
        year: form.year === "" ? null : Number(form.year),
        fuelType: form.fuel_type || null,
        serviceCenterId: Number(form.service_center_id),
        serviceId: form.service_id ? Number(form.service_id) : null,
        bookingDate: form.booking_date,
        bookingTime: form.booking_time,
        problemDescription: form.problem_description.trim() || null,
      });

      setConfirmation({
        bookingId,
        phone,
        centerName: center.name,
        serviceName: service?.name ?? "General repair",
        estimatedCost: service?.price ?? null,
        bookingDate: form.booking_date,
        bookingTime: form.booking_time,
      });

      setForm(emptyForm);
      window.scrollTo({ top: 0 });
    } catch (err) {
      console.error("Failed to create booking:", err);
      setFormError(err.message || "Unable to create the booking.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  }

  // ----- After a successful booking -----
  if (confirmation) {
    return (
      <div>
        <PageHeader label="Booking" title="Booking received" />

        <main className="page-content">
          <div className="section-card confirm-card">
            <div className="confirm-icon" aria-hidden="true">
              ✓
            </div>

            <p>Your booking number is</p>

            <p className="confirm-number">#{confirmation.bookingId}</p>

            <p className="confirm-note">
              Keep this number. You need it, together with your phone number,
              to track or cancel the booking.
            </p>

            <dl className="detail-grid confirm-details">
              <div>
                <dt>Service center</dt>
                <dd>{confirmation.centerName}</dd>
              </div>

              <div>
                <dt>Service</dt>
                <dd>{confirmation.serviceName}</dd>
              </div>

              <div>
                <dt>When</dt>
                <dd>
                  {formatDate(confirmation.bookingDate)},{" "}
                  {formatTime(confirmation.bookingTime)}
                </dd>
              </div>

              <div>
                <dt>Estimated cost</dt>
                <dd>{formatCurrency(confirmation.estimatedCost)}</dd>
              </div>
            </dl>

            <div className="confirm-actions">
              <button
                type="button"
                className="primary-btn"
                onClick={() =>
                  navigate("/track", {
                    state: {
                      bookingId: confirmation.bookingId,
                      phone: confirmation.phone,
                    },
                  })
                }
              >
                Track this booking
              </button>

              <button
                type="button"
                className="secondary-btn"
                onClick={() => setConfirmation(null)}
              >
                Book another service
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ----- The booking form -----
  const hasCenters = Boolean(data && data.centers.length > 0);

  return (
    <div>
      <PageHeader
        label="Booking"
        title="Book a Service"
        subtitle="Fill in your details, choose a service center and pick a time. No account needed."
      />

      <main className="page-content">
        {loading && <LoadingSpinner />}

        {!loading && error && <ErrorMessage message={error} onRetry={reload} />}

        {!loading && !error && data && !hasCenters && (
          <div className="section-card">
            <EmptyState
              title="No service centers available yet"
              message="Please check back later. Service centers are added by the admin."
            />
          </div>
        )}

        {!loading && !error && data && hasCenters && (
          <form onSubmit={handleSubmit}>
            {formError && <p className="form-error">{formError}</p>}

            {/* 1. Customer */}
            <div className="section-card">
              <div className="section-header">
                <h2>Your details</h2>
                <p>So the service center can contact you about the booking.</p>
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="booking-name">Full name</label>
                  <input
                    id="booking-name"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    autoComplete="name"
                    maxLength={100}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="booking-phone">Phone number</label>
                  <input
                    id="booking-phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    placeholder="9876543210"
                    required
                  />
                </div>

                <div className="form-field form-field-wide">
                  <label htmlFor="booking-email">Email (optional)</label>
                  <input
                    id="booking-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                </div>
              </div>
            </div>

            {/* 2. Vehicle */}
            <div className="section-card">
              <div className="section-header">
                <h2>Your vehicle</h2>
                <p>The car you are bringing in.</p>
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="booking-registration">
                    Registration number
                  </label>
                  <input
                    id="booking-registration"
                    name="registration_number"
                    value={form.registration_number}
                    onChange={handleChange}
                    placeholder="KA01AB1234"
                    maxLength={15}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="booking-brand">Brand</label>
                  <input
                    id="booking-brand"
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                    placeholder="Maruti Suzuki"
                    maxLength={50}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="booking-model">Model</label>
                  <input
                    id="booking-model"
                    name="model"
                    value={form.model}
                    onChange={handleChange}
                    placeholder="Swift"
                    maxLength={50}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="booking-year">Year (optional)</label>
                  <input
                    id="booking-year"
                    name="year"
                    type="number"
                    min="1950"
                    max={maxYear}
                    value={form.year}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="booking-fuel">Fuel type (optional)</label>
                  <select
                    id="booking-fuel"
                    name="fuel_type"
                    value={form.fuel_type}
                    onChange={handleChange}
                  >
                    <option value="">Select fuel type</option>

                    {FUEL_TYPES.map((fuel) => (
                      <option key={fuel} value={fuel}>
                        {fuel}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Service */}
            <div className="section-card">
              <div className="section-header">
                <h2>Service and time</h2>
                <p>Where and when you would like the work done.</p>
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="booking-center">Service center</label>
                  <select
                    id="booking-center"
                    name="service_center_id"
                    value={form.service_center_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a service center</option>

                    {data.centers.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>

                  {center && (
                    <p className="form-hint">
                      {center.address}
                      {openingTime && closingTime
                        ? ` · Open ${formatTime(openingTime)} – ${formatTime(closingTime)}`
                        : ""}
                    </p>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor="booking-service">Service</label>
                  <select
                    id="booking-service"
                    name="service_id"
                    value={form.service_id}
                    onChange={handleChange}
                    disabled={!center || centerServices.length === 0}
                    required={centerServices.length > 0}
                  >
                    <option value="">
                      {center ? "Select a service" : "Choose a center first"}
                    </option>

                    {centerServices.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} · {formatCurrency(item.price)}
                      </option>
                    ))}
                  </select>

                  {service && (
                    <p className="form-hint">
                      {service.description ? `${service.description} · ` : ""}
                      Estimated cost {formatCurrency(service.price)}
                    </p>
                  )}

                  {mustDescribeProblem && (
                    <p className="form-hint">
                      This center has not listed its services yet. Describe the
                      problem below instead.
                    </p>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor="booking-date">Date</label>
                  <input
                    id="booking-date"
                    name="booking_date"
                    type="date"
                    min={today}
                    value={form.booking_date}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="booking-time">Time</label>
                  <input
                    id="booking-time"
                    name="booking_time"
                    type="time"
                    value={form.booking_time}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-field form-field-wide">
                  <label htmlFor="booking-problem">
                    Describe the problem
                    {mustDescribeProblem ? "" : " (optional)"}
                  </label>
                  <textarea
                    id="booking-problem"
                    name="problem_description"
                    value={form.problem_description}
                    onChange={handleChange}
                    placeholder="For example: brakes make a grinding noise"
                    maxLength={1000}
                    required={mustDescribeProblem}
                  />
                </div>
              </div>

              <div className="form-actions">
                <Link to="/" className="secondary-btn">
                  Cancel
                </Link>

                <button type="submit" className="primary-btn" disabled={saving}>
                  {saving ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

export default BookService;
