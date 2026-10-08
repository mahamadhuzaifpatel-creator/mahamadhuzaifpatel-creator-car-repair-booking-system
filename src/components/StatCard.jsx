import "./StatCard.css";

function StatCard({ title, value, description }) {
  return (
    <div className="stat-card">
      <p className="stat-title">{title}</p>

      <p className="stat-value">{value}</p>

      <p className="stat-description">{description}</p>
    </div>
  );
}

export default StatCard;
