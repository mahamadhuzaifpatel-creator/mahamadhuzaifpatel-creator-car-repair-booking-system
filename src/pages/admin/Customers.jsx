import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";

import { useAsync } from "../../hooks/useAsync";
import { getCustomers } from "../../services/adminService";
import { formatDate } from "../../lib/format";

function Customers() {
  const { data: customers, loading, error, reload } = useAsync(getCustomers);

  return (
    <div>
      <PageHeader
        label="Admin Management"
        title="Customers"
        subtitle="Everyone who has made a booking."
      />

      <main className="page-content">
        {loading && <LoadingSpinner />}

        {!loading && error && <ErrorMessage message={error} onRetry={reload} />}

        {!loading && !error && customers && (
          <div className="section-card">
            {customers.length === 0 ? (
              <EmptyState
                title="No customers found"
                message="Customers will appear here after they make their first booking."
              />
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>First booking</th>
                    </tr>
                  </thead>

                  <tbody>
                    {customers.map((customer) => (
                      <tr key={customer.id}>
                        <td>{customer.full_name || "—"}</td>
                        <td className="nowrap">{customer.phone || "—"}</td>
                        <td>{customer.email || "—"}</td>
                        <td className="nowrap">
                          {formatDate(customer.created_at)}
                        </td>
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
