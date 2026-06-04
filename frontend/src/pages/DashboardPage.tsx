import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  MdTrendingUp,
  MdPeople,
  MdWarning,
  MdShowChart,
  MdSupervisorAccount,
  MdHistory,
  MdSecurity,
  MdAssignment,
  MdPerson,
  MdStar,
  MdTimeline,
  MdLocationOn,
} from "react-icons/md";
import { dashboardService } from "../services/dashboardService";
import { useAppSelector } from "../store";
import { selectAuth } from "../store/slices/authSlice";

const COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#64748b"];
const CATEGORY_COLORS = ["#4f46e5", "#06b6d4", "#8b5cf6", "#f59e0b", "#ec4899"];

const ProviderDashboardView: React.FC<{
  providerId: number;
  fullName: string;
}> = ({ providerId, fullName }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["provider-dashboard", providerId],
    queryFn: () => dashboardService.getProviderDashboard(providerId),
    staleTime: 30000,
  });

  if (isLoading)
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  if (error || !data)
    return (
      <div className="empty-state">
        <h3>Failed to load your dashboard</h3>
      </div>
    );

  const scoreColor =
    data.overallScore >= 4
      ? "#22c55e"
      : data.overallScore >= 3
        ? "#f59e0b"
        : "#ef4444";
  const statusColor =
    data.status === "Active"
      ? "badge-active"
      : data.status === "At-Risk"
        ? "badge-at-risk"
        : "badge-inactive";

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>My Dashboard</h1>
          <p style={{ color: "#64748b", fontSize: 14, margin: "4px 0 0" }}>
            Welcome back, {fullName}
            <span
              className={`badge ${statusColor}`}
              style={{ marginLeft: 10, fontSize: 11 }}
            >
              {data.status}
            </span>
          </p>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card" style={{ borderLeft: "4px solid #4f46e5" }}>
          <div className="kpi-icon">
            <MdPerson />
          </div>
          <div className="kpi-content">
            <h3>{data.specialty}</h3>
            <div className="value" style={{ fontSize: 18 }}>
              {fullName}
            </div>
            <div className="change" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <MdLocationOn />
              {data.location || "N/A"}
            </div>
          </div>
        </div>

        <div
          className="kpi-card"
          style={{ borderLeft: `4px solid ${scoreColor}` }}
        >
          <div className="kpi-icon" style={{ color: scoreColor }}>
            <MdStar />
          </div>
          <div className="kpi-content">
            <h3>Overall Score</h3>
            <div className="value" style={{ color: scoreColor }}>
              {data.overallScore.toFixed(2)}
            </div>
            <div className="change">out of 5.0</div>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: "4px solid #06b6d4" }}>
          <div className="kpi-icon">
            <MdTimeline />
          </div>
          <div className="kpi-content">
            <h3>Total Evaluations</h3>
            <div className="value">{data.totalEvaluations}</div>
            <div className="change">All-time reviews</div>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: "4px solid #8b5cf6" }}>
          <div className="kpi-icon">
            <MdTrendingUp />
          </div>
          <div className="kpi-content">
            <h3>Monthly Change</h3>
            <div className="value">
              {data.monthlyChange > 0 ? "+" : ""}
              {data.monthlyChange}%
            </div>
            <div
              className={`change ${data.monthlyChange >= 0 ? "positive" : "negative"}`}
            >
              {data.monthlyChange >= 0 ? "Improvement" : "Decline"}
            </div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>My Score Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.scoreTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis domain={[0, 5]} stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="averageScore"
                name="My Score"
                stroke="#4f46e5"
                strokeWidth={3}
                dot={{ fill: "#4f46e5", r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Performance by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={data.categoryScores}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="category" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
              <Radar
                name="Score"
                dataKey="averageScore"
                stroke="#4f46e5"
                fill="#4f46e5"
                fillOpacity={0.3}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Category Scores</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.categoryScores} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                type="number"
                domain={[0, 5]}
                stroke="#94a3b8"
                fontSize={12}
              />
              <YAxis
                type="category"
                dataKey="category"
                width={130}
                stroke="#94a3b8"
                fontSize={11}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Bar dataKey="averageScore" name="Score" radius={[0, 4, 4, 0]}>
                {data.categoryScores.map((_entry, i) => (
                  <Cell
                    key={i}
                    fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card" style={{ marginTop: 24 }}>
        <h3>
          <MdHistory />
          Recent Evaluations
        </h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Score</th>
                <th>Notes</th>
                <th>Evaluated By</th>
              </tr>
            </thead>
            <tbody>
              {data.recentScores.map((s) => (
                <tr key={s.id}>
                  <td>{new Date(s.evaluationDate).toLocaleDateString()}</td>
                  <td>{s.category || "—"}</td>
                  <td>
                    <span
                      style={{
                        color:
                          s.score >= 4
                            ? "#22c55e"
                            : s.score >= 3
                              ? "#f59e0b"
                              : "#ef4444",
                        fontWeight: 600,
                      }}
                    >
                      {s.score.toFixed(2)}
                    </span>
                  </td>
                  <td>{s.notes || "—"}</td>
                  <td>{s.evaluatedBy || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const { role, fullName, providerId } = useAppSelector(selectAuth);
  const isAdmin = role === "Admin";
  const isManager = role === "Manager";
  const isProvider = role === "Viewer" && providerId != null;

  if (isProvider) {
    return (
      <ProviderDashboardView
        providerId={providerId}
        fullName={fullName || ""}
      />
    );
  }

  return (
    <AdminManagerDashboard
      role={role}
      fullName={fullName}
      isAdmin={isAdmin}
      isManager={isManager}
    />
  );
};

const AdminManagerDashboard: React.FC<{
  role: string | null;
  fullName: string | null;
  isAdmin: boolean;
  isManager: boolean;
}> = ({ role, fullName, isAdmin, isManager }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardService.getDashboard,
    staleTime: 30000,
  });

  const { data: adminSummary } = useQuery({
    queryKey: ["admin-summary"],
    queryFn: dashboardService.getAdminSummary,
    staleTime: 30000,
    enabled: isAdmin,
  });

  if (isLoading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="empty-state">
        <h3>Failed to load dashboard</h3>
        <p>Please try again later.</p>
      </div>
    );
  }

  const {
    kpis,
    monthlyTrends,
    riskDistribution,
    topProviders,
    bottomProviders,
  } = data;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>
            {isAdmin
              ? "Admin Dashboard"
              : isManager
                ? "Manager Dashboard"
                : "Dashboard"}
          </h1>
          <p style={{ color: "#64748b", fontSize: 14, margin: "4px 0 0" }}>
            Welcome back, {fullName}
            <span
              className={`badge ${isAdmin ? "badge-active" : isManager ? "badge-at-risk" : "badge-inactive"}`}
              style={{ marginLeft: 10, fontSize: 11 }}
            >
              {role}
            </span>
          </p>
        </div>
      </div>

      {isAdmin && adminSummary && (
        <div className="kpi-grid" style={{ marginBottom: 8 }}>
          <div className="kpi-card" style={{ borderLeft: "4px solid #8b5cf6" }}>
            <div className="kpi-icon">
              <MdSupervisorAccount />
            </div>
            <div className="kpi-content">
              <h3>Total Users</h3>
              <div className="value">{adminSummary.totalUsers}</div>
              <div className="change">{adminSummary.activeUsers} active</div>
            </div>
          </div>
          <div className="kpi-card" style={{ borderLeft: "4px solid #06b6d4" }}>
            <div className="kpi-icon">
              <MdHistory />
            </div>
            <div className="kpi-content">
              <h3>Audit Entries</h3>
              <div className="value">{adminSummary.totalAuditLogs}</div>
              <div className="change">Total logged actions</div>
            </div>
          </div>
          <div className="kpi-card" style={{ borderLeft: "4px solid #f43f5e" }}>
            <div className="kpi-icon">
              <MdSecurity />
            </div>
            <div className="kpi-content">
              <h3>Access Level</h3>
              <div className="value">Full</div>
              <div className="change">All permissions</div>
            </div>
          </div>
          <div className="kpi-card" style={{ borderLeft: "4px solid #10b981" }}>
            <div className="kpi-icon">
              <MdAssignment />
            </div>
            <div className="kpi-content">
              <h3>System Status</h3>
              <div className="value">Healthy</div>
              <div className="change positive">All services running</div>
            </div>
          </div>
        </div>
      )}

      <div className="kpi-grid">
        <div className="kpi-card primary">
          <div className="kpi-icon">
            <MdShowChart />
          </div>
          <div className="kpi-content">
            <h3>Average Score</h3>
            <div className="value">{kpis.averageScore.toFixed(2)}</div>
            <div className="change positive">out of 5.0</div>
          </div>
        </div>

        <div className="kpi-card success">
          <div className="kpi-icon">
            <MdPeople />
          </div>
          <div className="kpi-content">
            <h3>Total Providers</h3>
            <div className="value">{kpis.totalProviders}</div>
            <div className="change">Active providers</div>
          </div>
        </div>

        <div className="kpi-card warning">
          <div className="kpi-icon">
            <MdWarning />
          </div>
          <div className="kpi-content">
            <h3>At-Risk Providers</h3>
            <div className="value">{kpis.atRiskProviders}</div>
            <div
              className={`change ${kpis.atRiskProviders > 0 ? "negative" : "positive"}`}
            >
              {kpis.atRiskProviders > 0 ? "Needs attention" : "All healthy"}
            </div>
          </div>
        </div>

        <div className="kpi-card info">
          <div className="kpi-icon">
            <MdTrendingUp />
          </div>
          <div className="kpi-content">
            <h3>Monthly Change</h3>
            <div className="value">
              {kpis.monthlyImprovement > 0 ? "+" : ""}
              {kpis.monthlyImprovement}%
            </div>
            <div
              className={`change ${kpis.monthlyImprovement >= 0 ? "positive" : "negative"}`}
            >
              {kpis.monthlyImprovement >= 0 ? "Improvement" : "Decline"}
            </div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Monthly Score Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis domain={[0, 5]} stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="averageScore"
                name="Avg Score"
                stroke="#4f46e5"
                strokeWidth={3}
                dot={{ fill: "#4f46e5", r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="count"
                nameKey="status"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {riskDistribution.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Top 5 Providers</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProviders} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                type="number"
                domain={[0, 5]}
                stroke="#94a3b8"
                fontSize={12}
              />
              <YAxis
                type="category"
                dataKey="providerName"
                width={140}
                stroke="#94a3b8"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Bar
                dataKey="averageScore"
                name="Avg Score"
                fill="#22c55e"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Bottom 5 Providers (At-Risk)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bottomProviders} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                type="number"
                domain={[0, 5]}
                stroke="#94a3b8"
                fontSize={12}
              />
              <YAxis
                type="category"
                dataKey="providerName"
                width={140}
                stroke="#94a3b8"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Bar
                dataKey="averageScore"
                name="Avg Score"
                fill="#ef4444"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {(isAdmin || isManager) && (
        <div className="chart-card" style={{ marginTop: 4 }}>
          <h3>
            <MdPeople />
            Recent Providers Overview
          </h3>
          <div
            className="table-container"
            style={{ boxShadow: "none", border: "none" }}
          >
            <table>
              <thead>
                <tr>
                  <th>Provider Name</th>
                  <th>Current Score</th>
                  <th>Risk Status</th>
                </tr>
              </thead>
              <tbody>
                {[...topProviders, ...bottomProviders]
                  .slice(0, 8)
                  .map((p, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{p.providerName}</td>
                      <td>
                        <span
                          style={{
                            fontWeight: 700,
                            color:
                              p.averageScore >= 4
                                ? "#22c55e"
                                : p.averageScore >= 3
                                  ? "#f59e0b"
                                  : "#ef4444",
                          }}
                        >
                          {p.averageScore.toFixed(2)}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            p.status === "Active"
                              ? "badge-active"
                              : p.status === "At-Risk"
                                ? "badge-at-risk"
                                : "badge-inactive"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isAdmin && adminSummary && adminSummary.recentActivity.length > 0 && (
        <div className="chart-card" style={{ marginTop: 24 }}>
          <h3>
            <MdHistory />
            Recent Activity
          </h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Entity ID</th>
                  <th>Modified By</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {adminSummary.recentActivity.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span
                        className={`badge ${log.actionType === "Create" ? "badge-active" : log.actionType === "Delete" ? "badge-at-risk" : "badge-inactive"}`}
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
          </div>
        </div>
      )}

      {!isAdmin && !isManager && (
        <div
          style={{
            marginTop: 24,
            padding: 16,
            background: "#eff6ff",
            borderRadius: 8,
            border: "1px solid #bfdbfe",
            color: "#1e40af",
            fontSize: 14,
          }}
        >
          <strong>View-only access.</strong> You are logged in as a{" "}
          <strong>Viewer</strong>. Contact an administrator to request elevated
          permissions for managing providers and scores.
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
