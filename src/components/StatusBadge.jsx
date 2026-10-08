import "./StatusBadge.css";

// A coloured pill for a booking status: pending, confirmed, completed, cancelled.
function StatusBadge({ status }) {
  const value = (status ?? "unknown").toLowerCase();
  const className = value.replace(/[^a-z]+/g, "-");

  return (
    <span className={`status-badge status-${className}`}>
      {value.replace(/_/g, " ")}
    </span>
  );
}

export default StatusBadge;
