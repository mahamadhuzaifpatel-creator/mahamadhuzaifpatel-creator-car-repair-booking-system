import { useState } from "react";
import { Link } from "react-router-dom";

import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import ServiceForm from "../../components/ServiceForm";

import { useAsync } from "../../hooks/useAsync";
import {
  getServices,
  getServiceCenters,
  createService,
  updateService,
} from "../../services/adminService";
import { formatCurrency } from "../../lib/format";

async function loadServicesPage() {
  const [services, centers] = await Promise.all([
    getServices(),
    getServiceCenters(),
  ]);

  return { services, centers };
}

function Services() {
  const { data, setData, loading, error, reload } = useAsync(loadServicesPage);

  const [formOpen, setFormOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  function openAddForm() {
    setEditingService(null);
    setFormOpen(true);
  }

  function openEditForm(service) {
    setEditingService(service);
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    setFormOpen(false);
    setEditingService(null);
  }

  async function handleSave(values) {
    if (editingService) {
      const updated = await updateService(editingService.id, values);

      setData((current) => ({
        ...current,
        services: current.services.map((service) =>
          service.id === updated.id ? updated : service
        ),
      }));
    } else {
      const created = await createService(values);

      setData((current) => ({
        ...current,
        services: [created, ...current.services],
      }));
    }

    closeForm();
  }

  function centerName(service) {
    const center = data.centers.find(
      (item) => item.id === service.service_center_id
    );

    return center?.name ?? "—";
  }

  const hasCenters = Boolean(data && data.centers.length > 0);

  return (
    <div>
      <PageHeader
        label="Admin Management"
        title="Services"
        subtitle="The repairs each service center offers, with prices."
      >
        <button
          type="button"
          className="primary-btn"
          onClick={openAddForm}
          disabled={!hasCenters}
        >
          Add Service
        </button>
      </PageHeader>

      <main className="page-content">
        {loading && <LoadingSpinner />}

        {!loading && error && <ErrorMessage message={error} onRetry={reload} />}

        {!loading && !error && data && (
          <>
            {formOpen && (
              <div className="section-card">
                <ServiceForm
                  key={editingService?.id ?? "new"}
                  service={editingService}
                  centers={data.centers}
                  onSave={handleSave}
                  onCancel={closeForm}
                />
              </div>
            )}

            <div className="section-card">
              {!hasCenters && (
                <EmptyState
                  title="Add a service center first"
                  message="Every service belongs to a service center, so create one before adding services."
                >
                  <Link to="/admin/service-centers" className="primary-btn">
                    Go to Service Centers
                  </Link>
                </EmptyState>
              )}

              {hasCenters && data.services.length === 0 && (
                <EmptyState
                  title="No services found"
                  message="Use the Add Service button to create the first one, for example an oil change."
                />
              )}

              {hasCenters && data.services.length > 0 && (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Service</th>
                        <th>Service Center</th>
                        <th>Price</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.services.map((service) => (
                        <tr key={service.id}>
                          <td>
                            {service.name ?? "—"}
                            {service.description && (
                              <span className="cell-sub">
                                {service.description}
                              </span>
                            )}
                          </td>
                          <td>{centerName(service)}</td>
                          <td className="nowrap">
                            {formatCurrency(service.price)}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="link-btn"
                              onClick={() => openEditForm(service)}
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

export default Services;
