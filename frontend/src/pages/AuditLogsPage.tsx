import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  MdAdminPanelSettings,
  MdSearch,
  MdArrowUpward,
  MdArrowDownward,
} from "react-icons/md";
import { auditLogService } from "../services/auditLogService";
import { useAppSelector, useAppDispatch } from "../store";
import {
  selectAuditLogFilters,
  setAuditLogSearch,
  setAuditLogFilters,
  setAuditLogPage,
  setAuditLogSorting,
} from "../store/slices/auditLogSlice";

const AuditLogsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const queryParams = useAppSelector(selectAuditLogFilters);
  const [searchText, setSearchText] = useState(queryParams.search || "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      dispatch(setAuditLogSearch(searchText));
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchText, dispatch]);

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", queryParams],
    queryFn: () => auditLogService.getAuditLogs(queryParams),
    staleTime: 15000,
    placeholderData: keepPreviousData,
  });

  const handleSort = useCallback(
    (field: string) => {
      dispatch(
        setAuditLogSorting({
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

  if (isLoading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>
          <MdAdminPanelSettings />
          Audit Logs
        </h1>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        <div className="kpi-card info">
          <div className="kpi-content">
            <h3>Total Audit Entries</h3>
            <div className="value">{data?.totalCount ?? 0}</div>
            <div className="change">All logged actions</div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-filters">
          <div className="search-input" style={{ flex: 1, maxWidth: 320 }}>
            <MdSearch />
            <input
              type="text"
              className="form-control"
              placeholder="Search by entity, user..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <select
            className="form-control"
            style={{ width: 160 }}
            value={queryParams.actionType || ""}
            onChange={(e) =>
              dispatch(
                setAuditLogFilters({
                  actionType: e.target.value || undefined,
                  page: 1,
                }),
              )
            }
          >
            <option value="">All Actions</option>
            <option value="Create">Create</option>
            <option value="Update">Update</option>
            <option value="Delete">Delete</option>
          </select>
          <select
            className="form-control"
            style={{ width: 170 }}
            value={queryParams.entityName || ""}
            onChange={(e) =>
              dispatch(
                setAuditLogFilters({
                  entityName: e.target.value || undefined,
                  page: 1,
                }),
              )
            }
          >
            <option value="">All Entities</option>
            <option value="Provider">Provider</option>
            <option value="ProviderScore">ProviderScore</option>
            <option value="User">User</option>
          </select>
        </div>

        {!data || data.items.length === 0 ? (
          <div className="empty-state">
            <MdAdminPanelSettings style={{ fontSize: 48, color: "#cbd5e1" }} />
            <h3>No audit logs found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th
                    onClick={() => handleSort("ActionType")}
                    style={{ cursor: "pointer" }}
                  >
                    Action <SortIcon field="ActionType" />
                  </th>
                  <th
                    onClick={() => handleSort("EntityName")}
                    style={{ cursor: "pointer" }}
                  >
                    Entity <SortIcon field="EntityName" />
                  </th>
                  <th
                    onClick={() => handleSort("EntityId")}
                    style={{ cursor: "pointer" }}
                  >
                    Entity ID <SortIcon field="EntityId" />
                  </th>
                  <th
                    onClick={() => handleSort("ModifiedBy")}
                    style={{ cursor: "pointer" }}
                  >
                    Modified By <SortIcon field="ModifiedBy" />
                  </th>
                  <th
                    onClick={() => handleSort("Timestamp")}
                    style={{ cursor: "pointer" }}
                  >
                    Timestamp <SortIcon field="Timestamp" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((log) => (
                  <tr key={log.id}>
                    <td>{log.id}</td>
                    <td>
                      <span
                        className={`badge ${
                          log.actionType === "Create"
                            ? "badge-active"
                            : log.actionType === "Delete"
                              ? "badge-at-risk"
                              : "badge-inactive"
                        }`}
                      >
                        {log.actionType}
                      </span>
                    </td>
                    <td>{log.entityName}</td>
                    <td>{log.entityId}</td>
                    <td>{log.modifiedBy || "—"}</td>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <div className="pagination-info">
                Showing {(data.page - 1) * data.pageSize + 1} to{" "}
                {Math.min(data.page * data.pageSize, data.totalCount)} of{" "}
                {data.totalCount} audit logs
              </div>
              <div className="pagination-buttons">
                <button
                  className="pagination-btn"
                  disabled={!data.hasPrevious}
                  onClick={() =>
                    dispatch(setAuditLogPage((queryParams.page || 1) - 1))
                  }
                >
                  Previous
                </button>
                {pageNumbers.map((num) => (
                  <button
                    key={num}
                    className={`pagination-btn ${num === data.page ? "active" : ""}`}
                    onClick={() => dispatch(setAuditLogPage(num))}
                  >
                    {num}
                  </button>
                ))}
                <button
                  className="pagination-btn"
                  disabled={!data.hasNext}
                  onClick={() =>
                    dispatch(setAuditLogPage((queryParams.page || 1) + 1))
                  }
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuditLogsPage;
