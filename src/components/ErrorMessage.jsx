import "./ErrorMessage.css";

function ErrorMessage({ message }) {
  return (
    <div className="error-message">
      <strong>Something went wrong</strong>

      <p>
        {message || "Unable to load the requested data."}
      </p>
    </div>
  );
}

export default ErrorMessage;