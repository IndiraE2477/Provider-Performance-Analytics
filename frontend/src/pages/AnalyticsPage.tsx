import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { dashboardService } from "../services/dashboardService";

const AnalyticsPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardService.getDashboard,
    staleTime: 30000,
  });

  if (isLoading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="empty-state">
        <h3>No analytics data available</h3>
      </div>
    );
  }

  const { topProviders, bottomProviders, riskDistribution, monthlyTrends } =
    data;

  const performanceComparison = [
    ...topProviders.slice(0, 3),
    ...bottomProviders.slice(0, 2),
  ].map((p) => ({
    provider: p.providerName.split(" ").slice(1).join(" "), // Remove "Dr."
    score: p.averageScore,
    fullMark: 5,
  }));

  return (
    <div>
      <div className="page-header">
        <h1>Analytics</h1>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Provider Performance Comparison</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={[...topProviders, ...bottomProviders]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="providerName"
                stroke="#94a3b8"
                fontSize={11}
                angle={-20}
                textAnchor="end"
                height={80}
              />
              <YAxis domain={[0, 5]} stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Legend />
              <Bar
                dataKey="averageScore"
                name="Average Score"
                fill="#4f46e5"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Provider Radar Analysis</h3>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={performanceComparison}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis
                dataKey="provider"
                stroke="#94a3b8"
                fontSize={11}
              />
              <PolarRadiusAxis domain={[0, 5]} tick={false} />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#4f46e5"
                fill="#4f46e5"
                fillOpacity={0.3}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Status Distribution</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={riskDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="status" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Bar
                dataKey="count"
                name="Providers"
                fill="#0ea5e9"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Score Trend Over Time</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={monthlyTrends}>
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
              <Legend />
              <Bar
                dataKey="averageScore"
                name="Avg Score"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
