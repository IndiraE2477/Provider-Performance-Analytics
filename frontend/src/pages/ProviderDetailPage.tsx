import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MdArrowBack,
  MdAdd,
  MdDelete,
  MdEdit,
  MdSmartToy,
  MdShield,
  MdLightbulb,
  MdTrendingUp,
} from "react-icons/md";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import { providerService } from "../services/providerService";
import { scoreService } from "../services/scoreService";
import { aiService } from "../services/aiService";
import { useAppSelector } from "../store";
import { selectHasRole } from "../store/slices/authSlice";
import type { CreateProviderScore, UpdateProviderScore } from "../types";

const scoreSchema = Yup.object({
  score: Yup.number()
    .required("Score is required")
    .min(0, "Score must be between 0 and 5")
    .max(5, "Score must be between 0 and 5"),
  category: Yup.string().notRequired(),
  notes: Yup.string().notRequired(),
  evaluationDate: Yup.string().notRequired(),
});

const ProviderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const canEdit = useAppSelector(selectHasRole(["Admin", "Manager"]));
  const canDelete = useAppSelector(selectHasRole(["Admin"]));

  const [showScoreModal, setShowScoreModal] = useState(false);
  const [editingScoreId, setEditingScoreId] = useState<number | null>(null);
  const [showAiPanel, setShowAiPanel] = useState(false);

  const canAi = useAppSelector(selectHasRole(["Admin", "Manager"]));

  const scoreFormik = useFormik({
    initialValues: {
      score: 3,
      category: "",
      notes: "",
      evaluationDate: new Date().toISOString().split("T")[0],
    },
    validationSchema: scoreSchema,
    validateOnMount: true,
    onSubmit: (values) => {
      if (editingScoreId) {
        updateScoreMutation.mutate({
          scoreId: editingScoreId,
          data: {
            score: values.score,
            category: values.category,
            notes: values.notes,
          },
        });
      } else {
        createScoreMutation.mutate({
          providerId: Number(id),
          score: values.score,
          category: values.category,
          notes: values.notes,
          evaluationDate: values.evaluationDate,
        });
      }
    },
  });

  const { data: provider, isLoading } = useQuery({
    queryKey: ["provider", id],
    queryFn: () => providerService.getProvider(Number(id)),
    enabled: !!id,
  });

  const { data: riskPrediction } = useQuery({
    queryKey: ["ai-risk", id],
    queryFn: () => aiService.getProviderRiskPrediction(Number(id)),
    enabled: !!id && showAiPanel && canAi,
    staleTime: 60000,
  });

  const { data: performanceSummary } = useQuery({
    queryKey: ["ai-summary", id],
    queryFn: () => aiService.getPerformanceSummary(Number(id)),
    enabled: !!id && showAiPanel && canAi,
    staleTime: 60000,
  });

  const { data: recommendations } = useQuery({
    queryKey: ["ai-recommendations", id],
    queryFn: () => aiService.getRecommendations(Number(id)),
    enabled: !!id && showAiPanel && canAi,
    staleTime: 60000,
  });

  const createScoreMutation = useMutation({
    mutationFn: (data: CreateProviderScore) => scoreService.createScore(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider", id] });
      toast.success("Score added successfully");
      closeScoreModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add score");
    },
  });

  const updateScoreMutation = useMutation({
    mutationFn: ({
      scoreId,
      data,
    }: {
      scoreId: number;
      data: UpdateProviderScore;
    }) => scoreService.updateScore(scoreId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider", id] });
      toast.success("Score updated successfully");
      closeScoreModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update score");
    },
  });

  const deleteScoreMutation = useMutation({
    mutationFn: (scoreId: number) => scoreService.deleteScore(scoreId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider", id] });
      toast.success("Score deleted successfully");
    },
  });

  const closeScoreModal = () => {
    setShowScoreModal(false);
    setEditingScoreId(null);
    scoreFormik.resetForm();
  };

  const openEditScoreModal = (score: {
    id: number;
    score: number;
    category: string | null;
    notes: string | null;
  }) => {
    setEditingScoreId(score.id);
    scoreFormik.setValues({
      score: score.score,
      category: score.category || "",
      notes: score.notes || "",
      evaluationDate: new Date().toISOString().split("T")[0],
    });
    setShowScoreModal(true);
  };

  if (isLoading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="empty-state">
        <h3>Provider not found</h3>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/providers")}
        >
          <MdArrowBack /> Back to Providers
        </button>
      </div>
    );
  }

  const statusClass =
    provider.status === "Active"
      ? "badge-active"
      : provider.status === "At-Risk"
        ? "badge-at-risk"
        : "badge-inactive";

  const categoryScores = provider.scores
    .reduce(
      (acc, score) => {
        const month = score.evaluationDate.substring(0, 7);
        const existing = acc.find((a) => a.month === month);
        if (existing) {
          existing.scores.push(score.score);
          existing.avgScore =
            existing.scores.reduce((s, v) => s + v, 0) / existing.scores.length;
        } else {
          acc.push({ month, scores: [score.score], avgScore: score.score });
        }
        return acc;
      },
      [] as { month: string; scores: number[]; avgScore: number }[],
    )
    .sort((a, b) => a.month.localeCompare(b.month));

  return (
    <div>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn-icon" onClick={() => navigate("/providers")}>
            <MdArrowBack size={24} />
          </button>
          <div>
            <h1>{provider.name}</h1>
            <span className={`badge ${statusClass}`}>{provider.status}</span>
          </div>
        </div>
        {canEdit && (
          <div style={{ display: "flex", gap: 8 }}>
            {canAi && (
              <button
                className={`btn ${showAiPanel ? "btn-secondary" : "btn-primary"}`}
                onClick={() => setShowAiPanel(!showAiPanel)}
                style={{ display: "flex", alignItems: "center", gap: 4 }}
              >
                <MdSmartToy /> {showAiPanel ? "Hide AI" : "AI Insights"}
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={() => setShowScoreModal(true)}
            >
              <MdAdd /> Add Score
            </button>
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>
          Provider Information
        </h3>
        <div className="detail-grid">
          <div className="detail-item">
            <label>Specialty</label>
            <p>{provider.specialty}</p>
          </div>
          <div className="detail-item">
            <label>Email</label>
            <p>{provider.email || "—"}</p>
          </div>
          <div className="detail-item">
            <label>Phone</label>
            <p>{provider.phone || "—"}</p>
          </div>
          <div className="detail-item">
            <label>Location</label>
            <p>{provider.location || "—"}</p>
          </div>
          <div className="detail-item">
            <label>Average Score</label>
            <p
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: provider.averageScore >= 3 ? "#22c55e" : "#ef4444",
              }}
            >
              {provider.averageScore.toFixed(2)} / 5.00
            </p>
          </div>
          <div className="detail-item">
            <label>Created</label>
            <p>{new Date(provider.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {categoryScores.length > 0 && (
        <div className="chart-card" style={{ marginBottom: 24 }}>
          <h3>Score Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={categoryScores}>
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
              <Line
                type="monotone"
                dataKey="avgScore"
                name="Average Score"
                stroke="#4f46e5"
                strokeWidth={3}
                dot={{ fill: "#4f46e5", r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* AI Insights Panel */}
      {showAiPanel && canAi && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 18,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <MdSmartToy style={{ color: "#4f46e5" }} /> AI Analysis for{" "}
            {provider.name}
          </h2>

          {/* Risk Prediction */}
          {riskPrediction && (
            <div
              className="card"
              style={{
                borderLeft: `4px solid ${riskPrediction.riskLevel === "High" ? "#ef4444" : riskPrediction.riskLevel === "Medium" ? "#f59e0b" : "#22c55e"}`,
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
                <h3
                  style={{
                    margin: 0,
                    fontSize: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <MdShield
                    style={{
                      color:
                        riskPrediction.riskLevel === "High"
                          ? "#ef4444"
                          : riskPrediction.riskLevel === "Medium"
                            ? "#f59e0b"
                            : "#22c55e",
                    }}
                  />
                  Risk Prediction
                </h3>
                <span
                  className={`badge ${riskPrediction.riskLevel === "High" ? "badge-at-risk" : riskPrediction.riskLevel === "Medium" ? "badge-inactive" : "badge-active"}`}
                >
                  {riskPrediction.riskLevel} Risk —{" "}
                  {riskPrediction.riskProbability}%
                </span>
              </div>
              <p style={{ margin: "0 0 8px", color: "#475569", fontSize: 14 }}>
                {riskPrediction.recommendation}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {riskPrediction.riskFactors.map((f, i) => (
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
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Performance Summary */}
          {performanceSummary && (
            <div
              className="card"
              style={{ borderLeft: "4px solid #4f46e5", padding: 20 }}
            >
              <h3
                style={{
                  margin: "0 0 12px",
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <MdTrendingUp style={{ color: "#4f46e5" }} />
                Performance Summary
                <span
                  className={`badge ${performanceSummary.trendDirection === "Improving" ? "badge-active" : performanceSummary.trendDirection === "Declining" ? "badge-at-risk" : "badge-inactive"}`}
                  style={{ fontSize: 11 }}
                >
                  {performanceSummary.trendDirection}
                </span>
              </h3>
              <p
                style={{
                  margin: "0 0 12px",
                  color: "#475569",
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                {performanceSummary.summary}
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <div>
                  <h4
                    style={{
                      margin: "0 0 8px",
                      fontSize: 13,
                      color: "#16a34a",
                    }}
                  >
                    Strengths
                  </h4>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: 18,
                      fontSize: 13,
                      color: "#475569",
                    }}
                  >
                    {performanceSummary.strengths.map((s, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4
                    style={{
                      margin: "0 0 8px",
                      fontSize: 13,
                      color: "#dc2626",
                    }}
                  >
                    Areas for Improvement
                  </h4>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: 18,
                      fontSize: 13,
                      color: "#475569",
                    }}
                  >
                    {performanceSummary.areasForImprovement.map((s, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations && recommendations.length > 0 && (
            <div
              className="card"
              style={{ borderLeft: "4px solid #8b5cf6", padding: 20 }}
            >
              <h3
                style={{
                  margin: "0 0 12px",
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <MdLightbulb style={{ color: "#8b5cf6" }} /> AI Recommendations
              </h3>
              {recommendations.map((rec, i) => (
                <div
                  key={i}
                  style={{
                    padding: "10px 14px",
                    marginBottom: i < recommendations.length - 1 ? 8 : 0,
                    background: "#f8fafc",
                    borderRadius: 8,
                    borderLeft: `3px solid ${rec.priority === "High" ? "#ef4444" : rec.priority === "Medium" ? "#f59e0b" : "#22c55e"}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <strong style={{ fontSize: 14 }}>{rec.action}</strong>
                    <span
                      className={`badge ${rec.priority === "High" ? "badge-at-risk" : rec.priority === "Medium" ? "badge-inactive" : "badge-active"}`}
                      style={{ fontSize: 10 }}
                    >
                      {rec.priority}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
                    {rec.reason}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="table-container">
        <div className="table-header">
          <h3>Score History ({provider.scores.length} records)</h3>
        </div>
        {provider.scores.length === 0 ? (
          <div className="empty-state">
            <h3>No scores recorded yet</h3>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Score</th>
                <th>Notes</th>
                <th>Evaluated By</th>
                {canEdit && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {provider.scores.map((score) => (
                <tr key={score.id}>
                  <td>{new Date(score.evaluationDate).toLocaleDateString()}</td>
                  <td>{score.category || "—"}</td>
                  <td>
                    <span
                      style={{
                        fontWeight: 600,
                        color:
                          score.score >= 4
                            ? "#22c55e"
                            : score.score >= 3
                              ? "#f59e0b"
                              : "#ef4444",
                      }}
                    >
                      {score.score.toFixed(2)}
                    </span>
                  </td>
                  <td>{score.notes || "—"}</td>
                  <td>{score.evaluatedBy || "—"}</td>
                  {canEdit && (
                    <td>
                      <button
                        className="btn-icon"
                        title="Edit Score"
                        onClick={() => openEditScoreModal(score)}
                      >
                        <MdEdit />
                      </button>
                      {canDelete && (
                        <button
                          className="btn-icon danger"
                          title="Delete Score"
                          onClick={() => {
                            if (window.confirm("Delete this score?"))
                              deleteScoreMutation.mutate(score.id);
                          }}
                        >
                          <MdDelete />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showScoreModal && (
        <div className="modal-overlay" onClick={closeScoreModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingScoreId ? "Update Score" : "Add Score"}</h2>
              <button className="btn-icon" onClick={closeScoreModal}>
                ✕
              </button>
            </div>
            <form onSubmit={scoreFormik.handleSubmit}>
              <div className="form-group">
                <label htmlFor="score">
                  Score (0 - 5) <span className="required-mark">*</span>
                </label>
                <input
                  id="score"
                  type="number"
                  step="0.01"
                  min="0"
                  max="5"
                  className={`form-control ${scoreFormik.touched.score && scoreFormik.errors.score ? "error" : ""}`}
                  {...scoreFormik.getFieldProps("score")}
                  onChange={(e) =>
                    scoreFormik.setFieldValue(
                      "score",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                />
                {scoreFormik.touched.score && scoreFormik.errors.score && (
                  <span className="error-text">{scoreFormik.errors.score}</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  className="form-control"
                  {...scoreFormik.getFieldProps("category")}
                >
                  <option value="">Select Category</option>
                  <option value="Quality of Care">Quality of Care</option>
                  <option value="Patient Satisfaction">
                    Patient Satisfaction
                  </option>
                  <option value="Efficiency">Efficiency</option>
                  <option value="Communication">Communication</option>
                  <option value="Compliance">Compliance</option>
                </select>
              </div>
              {!editingScoreId && (
                <div className="form-group">
                  <label htmlFor="evaluationDate">Evaluation Date</label>
                  <input
                    id="evaluationDate"
                    type="date"
                    className="form-control"
                    {...scoreFormik.getFieldProps("evaluationDate")}
                  />
                </div>
              )}
              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  className="form-control"
                  rows={3}
                  {...scoreFormik.getFieldProps("notes")}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeScoreModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    !scoreFormik.isValid ||
                    createScoreMutation.isPending ||
                    updateScoreMutation.isPending
                  }
                >
                  {createScoreMutation.isPending ||
                  updateScoreMutation.isPending
                    ? "Saving..."
                    : editingScoreId
                      ? "Update Score"
                      : "Add Score"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderDetailPage;
