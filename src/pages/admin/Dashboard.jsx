import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <p className="admin-label">CAR REPAIR BOOKING SYSTEM</p>
          <h1>Admin Dashboard</h1>
          <p className="admin-subtitle">
            Monitor customers, vehicles, service centers and bookings.
          </p>
        </div>

        <button className="logout-btn">Logout</button>
      </header>

      <main className="admin-content">
        <section className="stats-grid">
          <div className="stat-card">
            <span className="stat-title">Total Customers</span>
            <strong>0</strong>
          </div>

          <div className="stat-card">
            <span className="stat-title">Total Vehicles</span>
            <strong>0</strong>
          </div>

          <div className="stat-card">
            <span className="stat-title">Service Centers</span>
            <strong>0</strong>
          </div>

          <div className="stat-card">
            <span className="stat-title">Total Bookings</span>
            <strong>0</strong>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <h2>Recent Bookings</h2>
              <p>Latest booking activity in the system.</p>
            </div>
          </div>

          <div className="empty-state">
            <h3>No bookings yet</h3>
            <p>
              Recent customer bookings will appear here once the booking
              module is connected.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;