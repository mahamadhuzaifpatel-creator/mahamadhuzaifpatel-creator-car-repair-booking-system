import EmptyState from "../../components/EmptyState";

function Customers() {
  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <p className="admin-label">ADMIN MANAGEMENT</p>

          <h1>Customers</h1>

          <p className="admin-subtitle">
            View and manage registered customers.
          </p>
        </div>
      </header>

      <main className="admin-content">
        <div className="dashboard-section">
          <EmptyState
            title="No customers available"
            message="Customer records will appear here after Supabase is connected."
          />
        </div>
      </main>
    </div>
  );
}

export default Customers;