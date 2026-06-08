import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  MdError,
  MdSearch,
  MdArrowUpward,
  MdArrowDownward,
} from "react-icons/md";
import { errorLogService } from "../services/errorLogService";
import { useAppSelector, useAppDispatch } from "../store";
import {
  selectErrorLogFilters,
  setErrorLogSearch,
  setErrorLogFilters,
  setErrorLogPage,
  setErrorLogSorting,
} from "../store/slices/errorLogSlice";

const ErrorLogsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const queryParams = useAppSelector(selectErrorLogFilters);
  const [searchText, setSearchText] = useState(queryParams.search || "");
  const [hoveredLogId, setHoveredLogId] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      dispatch(setErrorLogSearch(searchText));
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchText, dispatch]);

  const { data, isLoading } = useQuery({
    queryKey: ["error-logs", queryParams],
    queryFn: () => errorLogService.getErrorLogs(queryParams),
    staleTime: 15000,
    placeholderData: keepPreviousData,
  });

  const handleSort = useCallback(
    (field: string) => {
      dispatch(
        setErrorLogSorting({
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
          <MdError />
          Error Logs
        </h1>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        <div className="kpi-card warning">
          <div className="kpi-content">
            <h3>Total Errors</h3>
            <div className="value">{data?.totalCount ?? 0}</div>
            <div className="change">Logged exceptions</div>
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
              placeholder="Search by message, source, path..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <select
            className="form-control"
            style={{ width: 150 }}
            value={queryParams.method || ""}
            onChange={(e) =>
              dispatch(
                setErrorLogFilters({
                  method: e.target.value || undefined,
                  page: 1,
                }),
              )
            }
          >
            <option value="">All Methods</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </select>
          <select
            className="form-control"
            style={{ width: 170 }}
            value={
              queryParams.statusCode !== undefined
                ? String(queryParams.statusCode)
                : ""
            }
            onChange={(e) =>
              dispatch(
                setErrorLogFilters({
                  statusCode: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                  page: 1,
                }),
              )
            }
          >
            <option value="">All Status Codes</option>
            <option value="400">400 Bad Request</option>
            <option value="401">401 Unauthorized</option>
            <option value="403">403 Forbidden</option>
            <option value="404">404 Not Found</option>
            <option value="500">500 Server Error</option>
          </select>
        </div>

        {!data || data.items.length === 0 ? (
          <div className="empty-state">
            <MdError style={{ fontSize: 48, color: "#cbd5e1" }} />
            <h3>No errors found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th
                    onClick={() => handleSort("Message")}
                    style={{ cursor: "pointer" }}
                  >
                    Error Message <SortIcon field="Message" />
                  </th>
                  <th
                    onClick={() => handleSort("Path")}
                    style={{ cursor: "pointer" }}
                  >
                    API Source <SortIcon field="Path" />
                  </th>
                  <th
                    onClick={() => handleSort("Method")}
                    style={{ cursor: "pointer" }}
                  >
                    Method <SortIcon field="Method" />
                  </th>
                  <th
                    onClick={() => handleSort("StatusCode")}
                    style={{ cursor: "pointer" }}
                  >
                    Status Code <SortIcon field="StatusCode" />
                  </th>
                  <th
                    onClick={() => handleSort("Timestamp")}
                    style={{ cursor: "pointer" }}
                  >
                    Logged Date <SortIcon field="Timestamp" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((log, index) => (
                  <tr key={log.id}>
                    <td>{(data.page - 1) * data.pageSize + index + 1}</td>
                    <td
                      style={{
                        maxWidth: 300,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        position: "relative",
                      }}
                      onMouseEnter={() => setHoveredLogId(log.id)}
                      onMouseLeave={() => setHoveredLogId(null)}
                    >
                      <span style={{ cursor: "pointer" }}>
                        {log.message}
                      </span>
                      {hoveredLogId === log.id && (
                        <div
                          style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            zIndex: 1000,
                            background: "#1e293b",
                            color: "#e2e8f0",
                            border: "1px solid #334155",
                            borderRadius: 8,
                            padding: "12px 16px",
                            minWidth: 400,
                            maxWidth: 600,
                            maxHeight: 300,
                            overflowY: "auto",
                            boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                            fontSize: 13,
                          }}
                        >
                          <div
                            style={{
                              marginBottom: 8,
                            }}
                          >
                            <strong style={{ color: "#f87171" }}>
                              Error Details
                            </strong>
                          </div>
                          <div style={{ marginBottom: 6 }}>
                            <strong>Message:</strong> {log.message}
                          </div>
                          {log.source && (
                            <div style={{ marginBottom: 6 }}>
                              <strong>Source:</strong> {log.source}
                            </div>
                          )}
                          {log.path && (
                            <div style={{ marginBottom: 6 }}>
                              <strong>Path:</strong> {log.method} {log.path}
                            </div>
                          )}
                          {log.statusCode && (
                            <div style={{ marginBottom: 6 }}>
                              <strong>Status Code:</strong> {log.statusCode}
                            </div>
                          )}
                          {log.stackTrace && (
                            <div>
                              <strong>Stack Trace:</strong>
                              <pre
                                style={{
                                  whiteSpace: "pre-wrap",
                                  wordBreak: "break-word",
                                  background: "#0f172a",
                                  padding: 8,
                                  borderRadius: 4,
                                  marginTop: 4,
                                  fontSize: 11,
                                  maxHeight: 150,
                                  overflowY: "auto",
                                }}
                              >
                                {log.stackTrace}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td>{log.path || "—"}</td>
                    <td>
                      <span className="badge badge-inactive">
                        {log.method || "—"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${log.statusCode && log.statusCode >= 500 ? "badge-at-risk" : "badge-inactive"}`}
                      >
                        {log.statusCode ?? "—"}
                      </span>
                    </td>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <div className="pagination-info">
                Showing {(data.page - 1) * data.pageSize + 1} to{" "}
                {Math.min(data.page * data.pageSize, data.totalCount)} of{" "}
                {data.totalCount} error logs
              </div>
              <div className="pagination-buttons">
                <button
                  className="pagination-btn"
                  disabled={!data.hasPrevious}
                  onClick={() =>
                    dispatch(setErrorLogPage((queryParams.page || 1) - 1))
                  }
                >
                  Previous
                </button>
                {pageNumbers.map((num) => (
                  <button
                    key={num}
                    className={`pagination-btn ${num === data.page ? "active" : ""}`}
                    onClick={() => dispatch(setErrorLogPage(num))}
                  >
                    {num}
                  </button>
                ))}
                <button
                  className="pagination-btn"
                  disabled={!data.hasNext}
                  onClick={() =>
                    dispatch(setErrorLogPage((queryParams.page || 1) + 1))
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

export default ErrorLogsPage;
