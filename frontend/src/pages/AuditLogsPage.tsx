import React from "react";
import { useQuery } from "@tanstack/react-query";
import { MdAdminPanelSettings } from "react-icons/md";
import { dashboardService } from "../services/dashboardService";

const AuditLogsPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-summary"],
    queryFn: dashboardService.getAdminSummary,
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
          <MdAdminPanelSettings />
          Audit Logs
        </h1>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        <div className="kpi-card primary">
          <div className="kpi-content">
            <h3>Total Users</h3>
            <div className="value">{data?.totalUsers ?? 0}</div>
            <div className="change">{data?.activeUsers ?? 0} active</div>
          </div>
        </div>
        <div className="kpi-card info">
          <div className="kpi-content">
            <h3>Total Audit Entries</h3>
            <div className="value">{data?.totalAuditLogs ?? 0}</div>
            <div className="change">All logged actions</div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Entity ID</th>
              <th>Modified By</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {data?.recentActivity && data.recentActivity.length > 0 ? (
              data.recentActivity.map((log) => (
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
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}
                >
                  No audit logs recorded yet. Actions like creating, updating,
                  or deleting providers will appear here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogsPage;
