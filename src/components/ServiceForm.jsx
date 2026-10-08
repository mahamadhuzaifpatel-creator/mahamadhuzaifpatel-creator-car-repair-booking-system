import { useState } from "react";

// Used for both adding and editing a service (for example "Oil change").
// Every service belongs to one service center.
function ServiceForm({ service, centers, onSave, onCancel }) {
  const [form, setForm] = useState({
    service_center_id: service?.service_center_id
      ? String(service.service_center_id)
      : "",
    name: service?.name ?? "",
    description: service?.description ?? "",
    price:
      service?.price === null || service?.price === undefined
        ? ""
        : String(service.price),
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

    const price = Number(form.price);

    if (form.price === "" || Number.isNaN(price) || price < 0) {
      setError("Enter a price of 0 or more.");
      return;
    }

    setSaving(true);

    try {
      await onSave({
        service_center_id: Number(form.service_center_id),
        name: form.name.trim(),
        description: form.description.trim() || null,
        price,
      });
    } catch (err) {
      console.error("Failed to save service:", err);
      setError(err.message || "Unable to save service.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="form-title">{service ? "Edit Service" : "Add Service"}</h2>

      {error && <p className="form-error">{error}</p>}

      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="service-center">Service center</label>
          <select
            id="service-center"
            name="service_center_id"
            value={form.service_center_id}
            onChange={handleChange}
            required
          >
            <option value="">Select a service center</option>

            {centers.map((center) => (
              <option key={center.id} value={center.id}>
                {center.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="service-name">Service name</label>
          <input
            id="service-name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Oil change"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="service-price">Price (₹)</label>
          <input
            id="service-price"
            name="price"
            type="number"
            min="0"
            step="1"
            value={form.price}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-field form-field-wide">
          <label htmlFor="service-description">Description (optional)</label>
          <textarea
            id="service-description"
            name="description"
            value={form.description}
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

export default ServiceForm;
