import "./StatCard.css";

function StatCard({ title, value, description }) {
  return (
    <div className="stat-card">
      <span className="stat-card-title">{title}</span>

      <strong className="stat-card-value">
        {value}
      </strong>

      {description && (
        <span className="stat-card-description">
          {description}
        </span>
      )}
    </div>
  );
}

export default StatCard;