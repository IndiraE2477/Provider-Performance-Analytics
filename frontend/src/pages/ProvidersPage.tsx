import React, { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  MdSearch,
  MdAdd,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdArrowUpward,
  MdArrowDownward,
  MdPeople,
} from "react-icons/md";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import { providerService } from "../services/providerService";
import { useAppSelector, useAppDispatch } from "../store";
import { selectHasRole } from "../store/slices/authSlice";
import {
  selectProviderFilters,
  setFilters,
  setSearch,
  setPage,
  setSorting,
} from "../store/slices/providerSlice";
import type { CreateProvider, UpdateProvider, Provider } from "../types";

const COUNTRY_CODES = [
  { code: "+1", label: "+1 (US)" },
  { code: "+44", label: "+44 (UK)" },
  { code: "+91", label: "+91 (IN)" },
  { code: "+61", label: "+61 (AU)" },
  { code: "+81", label: "+81 (JP)" },
  { code: "+49", label: "+49 (DE)" },
  { code: "+33", label: "+33 (FR)" },
  { code: "+86", label: "+86 (CN)" },
  { code: "+55", label: "+55 (BR)" },
  { code: "+971", label: "+971 (AE)" },
];

const LOCATIONS = [
  "New York, NY",
  "Los Angeles, CA",
  "Chicago, IL",
  "Houston, TX",
  "Phoenix, AZ",
  "Philadelphia, PA",
  "San Antonio, TX",
  "San Diego, CA",
  "Dallas, TX",
  "San Jose, CA",
  "Austin, TX",
  "Jacksonville, FL",
  "San Francisco, CA",
  "Columbus, OH",
  "Charlotte, NC",
  "Indianapolis, IN",
  "Seattle, WA",
  "Denver, CO",
  "Washington, DC",
  "Boston, MA",
  "Nashville, TN",
  "Detroit, MI",
  "Portland, OR",
  "Las Vegas, NV",
  "Atlanta, GA",
  "Miami, FL",
];

const getProviderSchema = (existingEmails: string[], currentEmail?: string) =>
  Yup.object({
    name: Yup.string().trim().required("Provider name is required"),
    specialty: Yup.string().trim().required("Specialty is required"),
    email: Yup.string()
      .trim()
      .required("Email is required")
      .email("Invalid email address")
      .test("unique-email", "This email is already in use", (value) => {
        if (!value) return true;
        const normalised = value.toLowerCase();
        if (currentEmail && normalised === currentEmail.toLowerCase())
          return true;
        return !existingEmails.some((e) => e.toLowerCase() === normalised);
      }),
    countryCode: Yup.string().required("Country code is required"),
    phoneNumber: Yup.string()
      .trim()
      .required("Phone number is required")
      .matches(/^\d{10,12}$/, "Phone number must be 10 to 12 digits"),
    location: Yup.string().notRequired(),
    status: Yup.string().notRequired(),
  });

const statusBadge = (status: string) => {
  const cls =
    status === "Active"
      ? "badge-active"
      : status === "At-Risk"
        ? "badge-at-risk"
        : "badge-inactive";
  return <span className={`badge ${cls}`}>{status}</span>;
};

const scoreColor = (score: number) => {
  if (score >= 4) return "#22c55e";
  if (score >= 3) return "#f59e0b";
  return "#ef4444";
};

const ProvidersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const queryParams = useAppSelector(selectProviderFilters);
  const canEdit = useAppSelector(selectHasRole(["Admin", "Manager"]));
  const canDelete = useAppSelector(selectHasRole(["Admin"]));
  const [showModal, setShowModal] = useState(false);
  const [editProvider, setEditProvider] = useState<Provider | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["providers", queryParams],
    queryFn: () => providerService.getProviders(queryParams),
    staleTime: 10000,
  });

  const existingEmails = useMemo(
    () => (data?.items || []).map((p) => p.email).filter(Boolean) as string[],
    [data],
  );

  const providerSchema = useMemo(
    () => getProviderSchema(existingEmails, editProvider?.email || undefined),
    [existingEmails, editProvider],
  );

  const formik = useFormik({
    initialValues: {
      name: "",
      specialty: "",
      email: "",
      countryCode: "+1",
      phoneNumber: "",
      location: "",
      status: "Active",
    },
    validationSchema: providerSchema,
    validateOnMount: true,
    onSubmit: (values) => {
      if (editProvider) {
        updateMutation.mutate({
          id: editProvider.id,
          data: {
            name: values.name,
            specialty: values.specialty,
            email: values.email || undefined,
            phone: `${values.countryCode} ${values.phoneNumber}` || undefined,
            location: values.location || undefined,
            status: values.status || "Active",
          },
        });
      } else {
        createMutation.mutate({
          name: values.name,
          specialty: values.specialty,
          email: values.email || undefined,
          phone: `${values.countryCode} ${values.phoneNumber}` || undefined,
          location: values.location || undefined,
        });
      }
    },
  });

  const { data: specialties } = useQuery({
    queryKey: ["specialties"],
    queryFn: providerService.getSpecialties,
    staleTime: 60000,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateProvider) => providerService.createProvider(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      toast.success("Provider created successfully");
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create provider");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProvider }) =>
      providerService.updateProvider(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      toast.success("Provider updated successfully");
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update provider");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => providerService.deleteProvider(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      toast.success("Provider deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete provider");
    },
  });

  const closeModal = useCallback(() => {
    setShowModal(false);
    setEditProvider(null);
    formik.resetForm();
  }, [formik]);

  const openCreateModal = useCallback(() => {
    setEditProvider(null);
    formik.resetForm();
    setShowModal(true);
  }, [formik]);

  const openEditModal = useCallback(
    (provider: Provider) => {
      setEditProvider(provider);
      const phoneParts = (provider.phone || "").match(/^(\+\d{1,4})\s*(.*)$/);
      formik.setValues({
        name: provider.name,
        specialty: provider.specialty,
        email: provider.email || "",
        countryCode: phoneParts ? phoneParts[1] : "+1",
        phoneNumber: phoneParts ? phoneParts[2] : provider.phone || "",
        location: provider.location || "",
        status: provider.status,
      });
      setShowModal(true);
    },
    [formik],
  );

  const handleSort = useCallback(
    (field: string) => {
      dispatch(
        setSorting({
          sortBy: field,
          sortOrder:
            queryParams.sortBy === field && queryParams.sortOrder === "asc"
              ? "desc"
              : "asc",
        }),
      );
    },
    [dispatch, queryParams.sortBy, queryParams.sortOrder],
  );

  const SortIcon = ({ field }: { field: string }) => {
    if (queryParams.sortBy !== field) return null;
    return queryParams.sortOrder === "asc" ? (
      <MdArrowUpward className="sort-icon" />
    ) : (
      <MdArrowDownward className="sort-icon" />
    );
  };

  const pageNumbers = useMemo(() => {
    if (!data) return [];
    const pages: number[] = [];
    for (let i = 1; i <= data.totalPages; i++) pages.push(i);
    return pages;
  }, [data]);

  return (
    <div>
      <div className="page-header">
        <h1>Providers</h1>
        {canEdit && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            <MdAdd /> Add Provider
          </button>
        )}
      </div>

      <div className="table-container">
        <div className="table-filters">
          <div className="search-input" style={{ flex: 1, maxWidth: 320 }}>
            <MdSearch />
            <input
              type="text"
              className="form-control"
              placeholder="Search providers..."
              value={queryParams.search || ""}
              onChange={(e) => dispatch(setSearch(e.target.value))}
            />
          </div>
          <select
            className="form-control"
            style={{ width: 180 }}
            value={queryParams.specialty || ""}
            onChange={(e) =>
              dispatch(
                setFilters({ specialty: e.target.value || undefined, page: 1 }),
              )
            }
          >
            <option value="">All Specialties</option>
            {specialties?.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            className="form-control"
            style={{ width: 150 }}
            value={queryParams.status || ""}
            onChange={(e) =>
              dispatch(
                setFilters({ status: e.target.value || undefined, page: 1 }),
              )
            }
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="At-Risk">At-Risk</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {isLoading ? (
          <div className="loading-spinner">
            <div className="spinner" />
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="empty-state">
            <MdPeople style={{ fontSize: 48, color: "#cbd5e1" }} />
            <h3>No providers found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleSort("Name")}>
                    Name <SortIcon field="Name" />
                  </th>
                  <th onClick={() => handleSort("Specialty")}>
                    Specialty <SortIcon field="Specialty" />
                  </th>
                  <th>Location</th>
                  <th onClick={() => handleSort("Score")}>
                    Score <SortIcon field="Score" />
                  </th>
                  <th onClick={() => handleSort("Status")}>
                    Status <SortIcon field="Status" />
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((provider) => (
                  <tr key={provider.id}>
                    <td style={{ fontWeight: 600 }}>{provider.name}</td>
                    <td>{provider.specialty}</td>
                    <td>{provider.location || "—"}</td>
                    <td>
                      <div className="score-bar">
                        <span
                          className="score-value"
                          style={{ color: scoreColor(provider.averageScore) }}
                        >
                          {provider.averageScore.toFixed(2)}
                        </span>
                        <div className="score-track">
                          <div
                            className="score-fill"
                            style={{
                              width: `${(provider.averageScore / 5) * 100}%`,
                              backgroundColor: scoreColor(
                                provider.averageScore,
                              ),
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>{statusBadge(provider.status)}</td>
                    <td>
                      <button
                        className="btn-icon"
                        title="View Details"
                        onClick={() => navigate(`/providers/${provider.id}`)}
                      >
                        <MdVisibility />
                      </button>
                      {canEdit && (
                        <button
                          className="btn-icon"
                          title="Edit"
                          onClick={() => openEditModal(provider)}
                        >
                          <MdEdit />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          className="btn-icon danger"
                          title="Delete"
                          onClick={() => {
                            if (
                              window.confirm(
                                `Delete provider "${provider.name}"?`,
                              )
                            )
                              deleteMutation.mutate(provider.id);
                          }}
                        >
                          <MdDelete />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <div className="pagination-info">
                Showing {(data.page - 1) * data.pageSize + 1} to{" "}
                {Math.min(data.page * data.pageSize, data.totalCount)} of{" "}
                {data.totalCount} providers
              </div>
              <div className="pagination-buttons">
                <button
                  className="pagination-btn"
                  disabled={!data.hasPrevious}
                  onClick={() => dispatch(setPage((queryParams.page || 1) - 1))}
                >
                  Previous
                </button>
                {pageNumbers.map((num) => (
                  <button
                    key={num}
                    className={`pagination-btn ${num === data.page ? "active" : ""}`}
                    onClick={() => dispatch(setPage(num))}
                  >
                    {num}
                  </button>
                ))}
                <button
                  className="pagination-btn"
                  disabled={!data.hasNext}
                  onClick={() => dispatch(setPage((queryParams.page || 1) + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editProvider ? "Edit Provider" : "Add Provider"}</h2>
              <button className="btn-icon" onClick={closeModal}>
                ✕
              </button>
            </div>

            <form onSubmit={formik.handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">
                  Provider Name <span className="required-mark">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  className={`form-control ${formik.touched.name && formik.errors.name ? "error" : ""}`}
                  {...formik.getFieldProps("name")}
                />
                {formik.touched.name && formik.errors.name && (
                  <span className="error-text">{formik.errors.name}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="specialty">
                  Specialty <span className="required-mark">*</span>
                </label>
                <select
                  id="specialty"
                  className={`form-control ${formik.touched.specialty && formik.errors.specialty ? "error" : ""}`}
                  {...formik.getFieldProps("specialty")}
                >
                  <option value="">Select a specialty</option>
                  {specialties?.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {formik.touched.specialty && formik.errors.specialty && (
                  <span className="error-text">{formik.errors.specialty}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  Email <span className="required-mark">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  className={`form-control ${formik.touched.email && formik.errors.email ? "error" : ""}`}
                  {...formik.getFieldProps("email")}
                />
                {formik.touched.email && formik.errors.email && (
                  <span className="error-text">{formik.errors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">
                  Phone <span className="required-mark">*</span>
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <select
                    id="countryCode"
                    className={`form-control ${formik.touched.countryCode && formik.errors.countryCode ? "error" : ""}`}
                    style={{ width: 120, flexShrink: 0 }}
                    {...formik.getFieldProps("countryCode")}
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <input
                    id="phoneNumber"
                    type="text"
                    className={`form-control ${formik.touched.phoneNumber && formik.errors.phoneNumber ? "error" : ""}`}
                    placeholder="Enter phone number"
                    maxLength={12}
                    value={formik.values.phoneNumber}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "");
                      formik.setFieldValue("phoneNumber", digits);
                    }}
                    onBlur={formik.handleBlur}
                    name="phoneNumber"
                  />
                </div>
                {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                  <span className="error-text">
                    {formik.errors.phoneNumber}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <select
                  id="location"
                  className="form-control"
                  {...formik.getFieldProps("location")}
                >
                  <option value="">Select a location</option>
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {editProvider && (
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    className="form-control"
                    {...formik.getFieldProps("status")}
                  >
                    <option value="Active">Active</option>
                    <option value="At-Risk">At-Risk</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              )}

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    !formik.isValid ||
                    createMutation.isPending ||
                    updateMutation.isPending
                  }
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : editProvider
                      ? "Update"
                      : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProvidersPage;
