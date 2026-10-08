import EmptyState from "../../components/EmptyState";

function Bookings() {
  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <p className="admin-label">ADMIN MANAGEMENT</p>

          <h1>Bookings</h1>

          <p className="admin-subtitle">
            Monitor all customer repair bookings.
          </p>
        </div>
      </header>

      <main className="admin-content">
        <div className="dashboard-section">
          <EmptyState
            title="No bookings available"
            message="Booking records will appear here after the booking module is connected."
          />
        </div>
      </main>
    </div>
  );
}

export default Bookings;