import EmptyState from "../../components/EmptyState";

function ServiceCenters() {
  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <p className="admin-label">ADMIN MANAGEMENT</p>

          <h1>Service Centers</h1>

          <p className="admin-subtitle">
            View and manage registered service centers.
          </p>
        </div>
      </header>

      <main className="admin-content">
        <div className="dashboard-section">
          <EmptyState
            title="No service centers available"
            message="Service center records will appear here after Supabase is connected."
          />
        </div>
      </main>
    </div>
  );
}

export default ServiceCenters;