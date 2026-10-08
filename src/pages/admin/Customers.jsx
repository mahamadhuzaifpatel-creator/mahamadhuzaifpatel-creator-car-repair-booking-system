import { useEffect, useState } from "react";
import "./AdminTable.css";

import EmptyState from "../../components/EmptyState";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";

import { getCustomers } from "../../services/adminService";

function formatDate(value) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCustomers() {
      try {
        const data = await getCustomers();
        setCustomers(data);
      } catch (err) {
        console.error("Failed to load customers:", err);
        setError(err.message || "Unable to load customers.");
      } finally {
        setLoading(false);
      }
    }

    loadCustomers();
  }, []);

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
        {loading && <LoadingSpinner />}

        {!loading && error && <ErrorMessage message={error} />}

        {!loading && !error && (
          <div className="dashboard-section">
            {customers.length === 0 ? (
              <EmptyState
                title="No customers found"
                message="Customers will appear here once they register."
              />
            ) : (
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Joined</th>
                    </tr>
                  </thead>

                  <tbody>
                    {customers.map((customer) => (
                      <tr key={customer.id}>
                        <td>{customer.full_name ?? customer.name ?? "—"}</td>
                        <td>{customer.email ?? "—"}</td>
                        <td>{customer.phone ?? customer.phone_number ?? "—"}</td>
                        <td>{formatDate(customer.created_at)}</td>
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

export default Customers;