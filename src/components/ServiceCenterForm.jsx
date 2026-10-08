import { useState } from "react";

import { toTimeInput } from "../lib/format";

// Used for both adding and editing a service center.
// Pass a center to edit it, or leave it out to add a new one.
function ServiceCenterForm({ center, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: center?.name ?? "",
    address: center?.address ?? "",
    phone: center?.phone ?? "",
    opening_time: toTimeInput(center?.opening_time),
    closing_time: toTimeInput(center?.closing_time),
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (
      form.opening_time &&
      form.closing_time &&
      form.closing_time <= form.opening_time
    ) {
      setError("Closing time must be after opening time.");
      return;
    }

    setSaving(true);

    try {
      await onSave({
        name: form.name.trim(),
        address: form.address.trim(),
        phone: form.phone.trim() || null,
        opening_time: form.opening_time || null,
        closing_time: form.closing_time || null,
      });
    } catch (err) {
      console.error("Failed to save service center:", err);
      setError(err.message || "Unable to save service center.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="form-title">
        {center ? "Edit Service Center" : "Add Service Center"}
      </h2>

      {error && <p className="form-error">{error}</p>}

      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="center-name">Name</label>
          <input
            id="center-name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="center-phone">Phone</label>
          <input
            id="center-phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
          />
        </div>

        <div className="form-field form-field-wide">
          <label htmlFor="center-address">Address</label>
          <input
            id="center-address"
            name="address"
            value={form.address}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="center-opening">Opening time</label>
          <input
            id="center-opening"
            name="opening_time"
            type="time"
            value={form.opening_time}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label htmlFor="center-closing">Closing time</label>
          <input
            id="center-closing"
            name="closing_time"
            type="time"
            value={form.closing_time}
            onChange={handleChange}
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

export default ServiceCenterForm;
