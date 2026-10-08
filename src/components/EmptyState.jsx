import "./EmptyState.css";

function EmptyState({ title, message }) {
  return (
    <div className="reusable-empty-state">
      <div className="empty-icon">—</div>

      <h3>{title}</h3>

      <p>{message}</p>
    </div>
  );
}

export default EmptyState;