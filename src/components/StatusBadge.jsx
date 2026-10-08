import "./StatusBadge.css";

function StatusBadge({ status }) {
  const formattedStatus = status
    ? status.replace(/_/g, " ")
    : "Unknown";

  return (
    <span
      className={`status-badge status-${status?.toLowerCase()}`}
    >
      {formattedStatus}
    </span>
  );
}

export default StatusBadge;