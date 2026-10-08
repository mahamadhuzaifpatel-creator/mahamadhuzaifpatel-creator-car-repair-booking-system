// Helpers that turn database values into text for the screen.

export function formatDate(value) {
  if (!value) return "—";

  // A plain date such as "2026-10-08" is treated as local time,
  // so it does not shift by a day in some time zones.
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(value) {
  if (!value) return "—";

  const [hours, minutes] = value.split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "—";

  return Number(value).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
}

// Today's date as "YYYY-MM-DD" in the user's own time zone.
export function todayISO() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);

  return local.toISOString().slice(0, 10);
}

// The current time as "HH:MM" in the user's own time zone.
export function nowTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

// Database times look like "09:00:00"; time inputs need "09:00".
export function toTimeInput(value) {
  return value ? value.slice(0, 5) : "";
}

export function vehicleLabel(vehicle) {
  if (!vehicle) return "—";

  return `${vehicle.brand} ${vehicle.model} (${vehicle.registration_number})`;
}
