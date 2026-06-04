import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  MdSmartToy,
  MdWarning,
  MdTrendingUp,
  MdBugReport,
  MdSend,
  MdLightbulb,
  MdShield,
  MdInfo,
  MdFlag,
  MdStar,
  MdAssignment,
} from "react-icons/md";
import { aiService } from "../services/aiService";
import { useAppSelector } from "../store";
import { selectAuth } from "../store/slices/authSlice";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  "Show high-risk providers",
  "Which provider improved most?",
  "Generate performance summary",
  "Who are the top providers?",
  "What is the average score?",
  "How many providers are there?",
  "Show specialties breakdown",
  "Show performance trends",
];

const AiInsightsPage: React.FC = () => {
  const { role } = useAppSelector(selectAuth);
  const isAdmin = role === "Admin";
  const [activeTab, setActiveTab] = useState<string>("insights");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");

  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ["ai-insights"],
    queryFn: aiService.getDashboardInsights,
    staleTime: 60000,
  });

  const { data: riskPredictions, isLoading: risksLoading } = useQuery({
    queryKey: ["ai-risk-predictions"],
    queryFn: aiService.getRiskPredictions,
    staleTime: 60000,
  });

  const { data: errorAnalysis, isLoading: errorsLoading } = useQuery({
    queryKey: ["ai-error-analysis"],
    queryFn: aiService.getErrorLogAnalysis,
    staleTime: 60000,
    enabled: isAdmin,
  });

  const assistantMutation = useMutation({
    mutationFn: (question: string) => aiService.askAssistant(question),
    onSuccess: (data) => {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer, timestamp: new Date() },
      ]);
    },
    onError: () => {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I could not process your question. Please try again.",
          timestamp: new Date(),
        },
      ]);
    },
  });

  const handleAskQuestion = (question?: string) => {
    const q = question || inputValue.trim();
    if (!q) return;
    setChatMessages((prev) => [
      ...prev,
      { role: "user", content: q, timestamp: new Date() },
    ]);
    setInputValue("");
    assistantMutation.mutate(q);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "High":
        return "#ef4444";
      case "Medium":
        return "#f59e0b";
      case "Low":
        return "#22c55e";
      default:
        return "#64748b";
    }
  };

  const getSeverityBadge = (severity: string) => {
    const cls =
      severity === "High"
        ? "badge-at-risk"
        : severity === "Medium"
          ? "badge-inactive"
          : "badge-active";
    return <span className={`badge ${cls}`}>{severity}</span>;
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "Risk":
        return <MdShield />;
      case "Trend":
        return <MdTrendingUp />;
      case "Warning":
        return <MdWarning />;
      case "Achievement":
        return <MdStar />;
      case "Action":
        return <MdFlag />;
      case "Summary":
        return <MdAssignment />;
      default:
        return <MdInfo />;
    }
  };

  const getRiskBadge = (level: string) => {
    const cls =
      level === "High"
        ? "badge-at-risk"
        : level === "Medium"
          ? "badge-inactive"
          : "badge-active";
    return <span className={`badge ${cls}`}>{level} Risk</span>;
  };

  const tabs = [
    { id: "insights", label: "Dashboard Insights", icon: <MdLightbulb /> },
    { id: "risks", label: "Risk Predictions", icon: <MdShield /> },
    { id: "assistant", label: "AI Assistant", icon: <MdSmartToy /> },
    ...(isAdmin
      ? [{ id: "errors", label: "Error Analysis", icon: <MdBugReport /> }]
      : []),
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>
            <MdSmartToy />
            AI Insights
          </h1>
          <p style={{ color: "#64748b", fontSize: 14, margin: "4px 0 0" }}>
            AI-powered analytics, risk predictions, and intelligent assistant
          </p>
        </div>
      </div>

      <div
        style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`btn ${activeTab === tab.id ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTab(tab.id)}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Dashboard Insights Tab */}
      {activeTab === "insights" && (
        <div>
          {insightsLoading ? (
            <div className="loading-spinner">
              <div className="spinner" />
            </div>
          ) : insights && insights.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {insights.map((insight, i) => (
                <div
                  key={i}
                  className="card"
                  style={{
                    borderLeft: `4px solid ${getSeverityColor(insight.severity)}`,
                    padding: 20,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span
                        style={{
                          color: getSeverityColor(insight.severity),
                          fontSize: 24,
                        }}
                      >
                        {getInsightIcon(insight.insightType)}
                      </span>
                      <div>
                        <h3
                          style={{ margin: 0, fontSize: 16, fontWeight: 600 }}
                        >
                          {insight.title}
                        </h3>
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>
                          {insight.insightType}
                        </span>
                      </div>
                    </div>
                    {getSeverityBadge(insight.severity)}
                  </div>
                  <p style={{ margin: 0, color: "#475569", lineHeight: 1.6 }}>
                    {insight.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No insights available</h3>
              <p>
                AI insights will appear here once there is enough data to
                analyze.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Risk Predictions Tab */}
      {activeTab === "risks" && (
        <div>
          {risksLoading ? (
            <div className="loading-spinner">
              <div className="spinner" />
            </div>
          ) : riskPredictions && riskPredictions.length > 0 ? (
            <>
              <div className="kpi-grid" style={{ marginBottom: 24 }}>
                <div
                  className="kpi-card"
                  style={{ borderLeft: "4px solid #ef4444" }}
                >
                  <div className="kpi-icon" style={{ color: "#ef4444" }}>
                    <MdWarning />
                  </div>
                  <div className="kpi-content">
                    <h3>High Risk</h3>
                    <div className="value">
                      {
                        riskPredictions.filter((r) => r.riskLevel === "High")
                          .length
                      }
                    </div>
                    <div className="change negative">
                      Immediate attention needed
                    </div>
                  </div>
                </div>
                <div
                  className="kpi-card"
                  style={{ borderLeft: "4px solid #f59e0b" }}
                >
                  <div className="kpi-icon" style={{ color: "#f59e0b" }}>
                    <MdShield />
                  </div>
                  <div className="kpi-content">
                    <h3>Medium Risk</h3>
                    <div className="value">
                      {
                        riskPredictions.filter((r) => r.riskLevel === "Medium")
                          .length
                      }
                    </div>
                    <div className="change">Monitor closely</div>
                  </div>
                </div>
                <div
                  className="kpi-card"
                  style={{ borderLeft: "4px solid #22c55e" }}
                >
                  <div className="kpi-icon" style={{ color: "#22c55e" }}>
                    <MdShield />
                  </div>
                  <div className="kpi-content">
                    <h3>Low Risk</h3>
                    <div className="value">
                      {
                        riskPredictions.filter((r) => r.riskLevel === "Low")
                          .length
                      }
                    </div>
                    <div className="change positive">Performing well</div>
                  </div>
                </div>
              </div>

              <div className="table-container">
                <div className="table-header">
                  <h3>Provider Risk Assessment</h3>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Provider</th>
                      <th>Risk Level</th>
                      <th>Probability</th>
                      <th>Risk Factors</th>
                      <th>Recommendation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {riskPredictions.map((prediction) => (
                      <tr key={prediction.providerId}>
                        <td style={{ fontWeight: 600 }}>
                          {prediction.providerName}
                        </td>
                        <td>{getRiskBadge(prediction.riskLevel)}</td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <div
                              style={{
                                width: 60,
                                height: 6,
                                background: "#e2e8f0",
                                borderRadius: 3,
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  width: `${prediction.riskProbability}%`,
                                  height: "100%",
                                  background: getSeverityColor(
                                    prediction.riskLevel,
                                  ),
                                  borderRadius: 3,
                                }}
                              />
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>
                              {prediction.riskProbability}%
                            </span>
                          </div>
                        </td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 4,
                            }}
                          >
                            {prediction.riskFactors.map((factor, i) => (
                              <span
                                key={i}
                                style={{
                                  fontSize: 11,
                                  padding: "2px 8px",
                                  background: "#f1f5f9",
                                  borderRadius: 12,
                                  color: "#475569",
                                }}
                              >
                                {factor}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td
                          style={{
                            fontSize: 13,
                            color: "#475569",
                            maxWidth: 300,
                          }}
                        >
                          {prediction.recommendation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <h3>No risk predictions available</h3>
              <p>Risk predictions require providers with score history.</p>
            </div>
          )}
        </div>
      )}

      {/* AI Assistant Tab */}
      {activeTab === "assistant" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <h3
              style={{
                margin: "0 0 12px",
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <MdSmartToy style={{ color: "#4f46e5" }} /> Quick Questions
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  className="btn btn-secondary"
                  style={{ fontSize: 13, padding: "6px 12px" }}
                  onClick={() => handleAskQuestion(q)}
                  disabled={assistantMutation.isPending}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div
            className="card"
            style={{
              padding: 0,
              display: "flex",
              flexDirection: "column",
              height: "calc(100vh - 420px)",
              minHeight: 400,
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #e2e8f0",
                background: "#f8fafc",
                borderRadius: "8px 8px 0 0",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: 15,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <MdSmartToy style={{ color: "#4f46e5" }} /> AI Assistant Chat
              </h3>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {chatMessages.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    color: "#94a3b8",
                    padding: "40px 0",
                  }}
                >
                  <MdSmartToy size={48} />
                  <p>
                    Ask me anything about provider performance, risks, and
                    trends!
                  </p>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent:
                      msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "75%",
                      padding: "12px 16px",
                      borderRadius: 12,
                      background: msg.role === "user" ? "#4f46e5" : "#f1f5f9",
                      color: msg.role === "user" ? "#fff" : "#1e293b",
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.6,
                      fontSize: 14,
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {assistantMutation.isPending && (
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: 12,
                      background: "#f1f5f9",
                      color: "#94a3b8",
                    }}
                  >
                    Thinking...
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                padding: 16,
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                gap: 8,
              }}
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about provider analytics..."
                className="form-input"
                style={{ flex: 1, margin: 0 }}
                disabled={assistantMutation.isPending}
              />
              <button
                className="btn btn-primary"
                onClick={() => handleAskQuestion()}
                disabled={!inputValue.trim() || assistantMutation.isPending}
                style={{ display: "flex", alignItems: "center", gap: 4 }}
              >
                <MdSend /> Ask
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Analysis Tab (Admin only) */}
      {activeTab === "errors" && isAdmin && (
        <div>
          {errorsLoading ? (
            <div className="loading-spinner">
              <div className="spinner" />
            </div>
          ) : errorAnalysis && errorAnalysis.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {errorAnalysis.map((analysis, i) => (
                <div
                  key={i}
                  className="card"
                  style={{
                    borderLeft: `4px solid ${getSeverityColor(analysis.severity)}`,
                    padding: 20,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 12,
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: 16,
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <MdBugReport
                          style={{ color: getSeverityColor(analysis.severity) }}
                        />
                        {analysis.pattern}
                      </h3>
                      <span style={{ fontSize: 13, color: "#94a3b8" }}>
                        {analysis.occurrences} occurrence(s)
                      </span>
                    </div>
                    {getSeverityBadge(analysis.severity)}
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <h4
                      style={{
                        margin: "0 0 4px",
                        fontSize: 13,
                        color: "#64748b",
                        fontWeight: 600,
                      }}
                    >
                      Root Cause
                    </h4>
                    <p
                      style={{
                        margin: 0,
                        color: "#475569",
                        fontSize: 14,
                        lineHeight: 1.5,
                      }}
                    >
                      {analysis.rootCause}
                    </p>
                  </div>
                  <div
                    style={{
                      background: "#f0fdf4",
                      padding: 12,
                      borderRadius: 8,
                    }}
                  >
                    <h4
                      style={{
                        margin: "0 0 4px",
                        fontSize: 13,
                        color: "#16a34a",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <MdLightbulb /> Suggestion
                    </h4>
                    <p
                      style={{
                        margin: 0,
                        color: "#15803d",
                        fontSize: 14,
                        lineHeight: 1.5,
                      }}
                    >
                      {analysis.suggestion}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No error patterns found</h3>
              <p>
                Error analysis will show patterns when error logs are available.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AiInsightsPage;
