import { useState } from "react";

import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import ServiceCenterForm from "../../components/ServiceCenterForm";

import { useAsync } from "../../hooks/useAsync";
import {
  getServiceCenters,
  createServiceCenter,
  updateServiceCenter,
} from "../../services/adminService";
import { formatTime } from "../../lib/format";

function ServiceCenters() {
  const {
    data: centers,
    setData: setCenters,
    loading,
    error,
    reload,
  } = useAsync(getServiceCenters);

  const [formOpen, setFormOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState(null);

  function openAddForm() {
    setEditingCenter(null);
    setFormOpen(true);
  }

  function openEditForm(center) {
    setEditingCenter(center);
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    setFormOpen(false);
    setEditingCenter(null);
  }

  async function handleSave(values) {
    if (editingCenter) {
      const updated = await updateServiceCenter(editingCenter.id, values);

      setCenters((current) =>
        current.map((center) => (center.id === updated.id ? updated : center))
      );
    } else {
      const created = await createServiceCenter(values);

      setCenters((current) => [created, ...current]);
    }

    closeForm();
  }

  return (
    <div>
      <PageHeader
        label="Admin Management"
        title="Service Centers"
        subtitle="View and manage registered service centers."
      >
        <button
          type="button"
          className="primary-btn"
          onClick={openAddForm}
          disabled={loading || Boolean(error)}
        >
          Add Service Center
        </button>
      </PageHeader>

      <main className="page-content">
        {loading && <LoadingSpinner />}

        {!loading && error && <ErrorMessage message={error} onRetry={reload} />}

        {!loading && !error && centers && (
          <>
            {formOpen && (
              <div className="section-card">
                <ServiceCenterForm
                  key={editingCenter?.id ?? "new"}
                  center={editingCenter}
                  onSave={handleSave}
                  onCancel={closeForm}
                />
              </div>
            )}

            <div className="section-card">
              {centers.length === 0 ? (
                <EmptyState
                  title="No service centers found"
                  message="Use the Add Service Center button to create the first one."
                />
              ) : (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Address</th>
                        <th>Phone</th>
                        <th>Hours</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {centers.map((center) => (
                        <tr key={center.id}>
                          <td>{center.name ?? "—"}</td>
                          <td>{center.address ?? "—"}</td>
                          <td className="nowrap">{center.phone ?? "—"}</td>
                          <td className="nowrap">
                            {center.opening_time && center.closing_time
                              ? `${formatTime(center.opening_time)} – ${formatTime(center.closing_time)}`
                              : "—"}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="link-btn"
                              onClick={() => openEditForm(center)}
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default ServiceCenters;
