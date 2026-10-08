import "./ErrorMessage.css";

function ErrorMessage({ title = "Something went wrong", message, onRetry }) {
  return (
    <div className="error-box" role="alert">
      <h3>{title}</h3>

      {message && <p>{message}</p>}

      {onRetry && (
        <button type="button" className="secondary-btn" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
