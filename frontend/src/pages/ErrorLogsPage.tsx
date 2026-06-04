import React from "react";
import { useQuery } from "@tanstack/react-query";
import { MdError } from "react-icons/md";
import { errorLogService } from "../services/errorLogService";

const ErrorLogsPage: React.FC = () => {
  const { data: errorLogs, isLoading } = useQuery({
    queryKey: ["error-logs"],
    queryFn: errorLogService.getErrorLogs,
    staleTime: 15000,
  });

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
            <div className="value">{errorLogs?.length ?? 0}</div>
            <div className="change">Logged exceptions</div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Error Message</th>
              <th>API Source</th>
              <th>Method</th>
              <th>Status Code</th>
              <th>Logged Date</th>
            </tr>
          </thead>
          <tbody>
            {errorLogs && errorLogs.length > 0 ? (
              errorLogs.map((log) => (
                <tr key={log.id}>
                  <td>{log.id}</td>
                  <td
                    style={{
                      maxWidth: 300,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={log.message}
                  >
                    {log.message}
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
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}
                >
                  No errors recorded. The system is running smoothly!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ErrorLogsPage;
