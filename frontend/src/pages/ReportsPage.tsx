import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  MdDownload,
  MdAssessment,
  MdPeople,
  MdTrendingUp,
  MdWarning,
} from "react-icons/md";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { toast } from "react-toastify";
import { reportService } from "../services/reportService";

const COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#64748b"];

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

const ReportsPage: React.FC = () => {
  const [downloading, setDownloading] = useState(false);

  const { data: report, isLoading } = useQuery({
    queryKey: ["report-data"],
    queryFn: reportService.getReportData,
    staleTime: 60000,
  });

  const handleDownloadCsv = async () => {
    setDownloading(true);
    try {
      await reportService.downloadCsv();
      toast.success("Report downloaded successfully");
    } catch {
      toast.error("Failed to download report");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>
            <MdAssessment style={{ verticalAlign: "middle", marginRight: 8 }} />
            Reports
          </h1>
          <p style={{ color: "#64748b", marginTop: 4 }}>
            Comprehensive provider performance analytics report
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn-primary"
            onClick={handleDownloadCsv}
            disabled={downloading}
          >
            <MdDownload style={{ marginRight: 4 }} />
            {downloading ? "Downloading..." : "Export CSV"}
          </button>
          <button className="btn btn-secondary" onClick={handlePrint}>
            Print Report
          </button>
        </div>
      </div>

      {/* Report Generated Info */}
      <div
        style={{
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          padding: "12px 16px",
          marginBottom: 24,
          fontSize: 13,
          color: "#64748b",
        }}
      >
        Report generated: {new Date(report.generatedAt).toLocaleString()}
      </div>

      {/* KPI Summary */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: "#ede9fe" }}>
            <MdAssessment color="#7c3aed" size={24} />
          </div>
          <div className="kpi-info">
            <div className="kpi-value">
              {report.kpis.averageScore.toFixed(2)}
            </div>
            <div className="kpi-label">Average Score</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: "#dbeafe" }}>
            <MdPeople color="#2563eb" size={24} />
          </div>
          <div className="kpi-info">
            <div className="kpi-value">{report.kpis.totalProviders}</div>
            <div className="kpi-label">Total Providers</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: "#fef3c7" }}>
            <MdWarning color="#f59e0b" size={24} />
          </div>
          <div className="kpi-info">
            <div className="kpi-value">{report.kpis.atRiskProviders}</div>
            <div className="kpi-label">At-Risk Providers</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: "#dcfce7" }}>
            <MdTrendingUp color="#22c55e" size={24} />
          </div>
          <div className="kpi-info">
            <div className="kpi-value">{report.kpis.monthlyImprovement}%</div>
            <div className="kpi-label">Monthly Improvement</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 24,
          marginBottom: 24,
        }}
      >
        {/* Monthly Trends Chart */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Monthly Performance Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={report.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Bar
                dataKey="averageScore"
                fill="#4f46e5"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Distribution */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={report.riskDistribution}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {report.riskDistribution.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top & Bottom Providers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          marginBottom: 24,
        }}
      >
        <div className="card">
          <h3 style={{ marginBottom: 16, color: "#22c55e" }}>
            Top 5 Providers
          </h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Provider</th>
                <th>Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {report.topProviders.map((p, i) => (
                <tr key={i}>
                  <td>{p.providerName}</td>
                  <td
                    style={{
                      color: scoreColor(p.averageScore),
                      fontWeight: 600,
                    }}
                  >
                    {p.averageScore.toFixed(2)}
                  </td>
                  <td>{statusBadge(p.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 16, color: "#ef4444" }}>
            Bottom 5 Providers
          </h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Provider</th>
                <th>Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {report.bottomProviders.map((p, i) => (
                <tr key={i}>
                  <td>{p.providerName}</td>
                  <td
                    style={{
                      color: scoreColor(p.averageScore),
                      fontWeight: 600,
                    }}
                  >
                    {p.averageScore.toFixed(2)}
                  </td>
                  <td>{statusBadge(p.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* All Providers Table */}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>All Providers Detail</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Specialty</th>
                <th>Location</th>
                <th>Status</th>
                <th>Avg Score</th>
                <th>Evaluations</th>
                <th>Last Evaluation</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {report.allProviders.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td>{p.specialty}</td>
                  <td>{p.location || "—"}</td>
                  <td>{statusBadge(p.status)}</td>
                  <td
                    style={{
                      color: scoreColor(p.averageScore),
                      fontWeight: 600,
                    }}
                  >
                    {p.averageScore.toFixed(2)}
                  </td>
                  <td>{p.totalEvaluations}</td>
                  <td>
                    {p.lastEvaluationDate
                      ? new Date(p.lastEvaluationDate).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
