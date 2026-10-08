import "./EmptyState.css";

// Shown when a list has nothing in it yet.
// Anything passed as children (for example a button) appears under the text.
function EmptyState({ title, message, children }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" aria-hidden="true">
        —
      </div>

      <h3>{title}</h3>

      {message && <p>{message}</p>}

      {children && <div className="empty-state-action">{children}</div>}
    </div>
  );
}

export default EmptyState;
