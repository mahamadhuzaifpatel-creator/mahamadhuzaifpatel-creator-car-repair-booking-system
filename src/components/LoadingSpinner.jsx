import "./LoadingSpinner.css";

function LoadingSpinner({ fullPage = false, label = "Loading..." }) {
  return (
    <div
      className={fullPage ? "spinner-wrap spinner-full" : "spinner-wrap"}
      role="status"
    >
      <span className="spinner" aria-hidden="true" />
      <span className="spinner-label">{label}</span>
    </div>
  );
}

export default LoadingSpinner;
