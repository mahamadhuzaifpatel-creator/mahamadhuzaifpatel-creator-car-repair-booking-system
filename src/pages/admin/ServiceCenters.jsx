import { useEffect, useState } from "react";
import "./AdminTable.css";

import EmptyState from "../../components/EmptyState";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";

import { getServiceCenters } from "../../services/adminService";
import { formatTime } from "../../lib/format";

function ServiceCenters() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCenters() {
      try {
        const data = await getServiceCenters();
        setCenters(data);
      } catch (err) {
        console.error("Failed to load service centers:", err);
        setError(err.message || "Unable to load service centers.");
      } finally {
        setLoading(false);
      }
    }

    loadCenters();
  }, []);

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
        {loading && <LoadingSpinner />}

        {!loading && error && <ErrorMessage message={error} />}

        {!loading && !error && (
          <div className="dashboard-section">
            {centers.length === 0 ? (
              <EmptyState
                title="No service centers found"
                message="Service centers will appear here once they are registered."
              />
            ) : (
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Address</th>
                      <th>Phone</th>
                      <th>Hours</th>
                      <th>Rating</th>
                    </tr>
                  </thead>

                  <tbody>
                    {centers.map((center) => (
                      <tr key={center.id}>
                        <td>{center.name ?? "—"}</td>
                        <td>{center.address ?? "—"}</td>
                        <td>{center.phone ?? "—"}</td>
                        <td>
                          {formatTime(center.opening_time)} –{" "}
                          {formatTime(center.closing_time)}
                        </td>
                        <td>{center.rating ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default ServiceCenters;