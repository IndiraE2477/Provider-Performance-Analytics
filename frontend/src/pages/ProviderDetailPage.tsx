import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MdArrowBack, MdAdd, MdDelete, MdEdit } from "react-icons/md";
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
import { providerService } from "../services/providerService";
import { scoreService } from "../services/scoreService";
import { useAppSelector } from "../store";
import { selectHasRole } from "../store/slices/authSlice";
import type { CreateProviderScore, UpdateProviderScore } from "../types";

const ProviderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const canEdit = useAppSelector(selectHasRole(["Admin", "Manager"]));
  const canDelete = useAppSelector(selectHasRole(["Admin"]));

  const [showScoreModal, setShowScoreModal] = useState(false);
  const [editingScoreId, setEditingScoreId] = useState<number | null>(null);
  const [scoreForm, setScoreForm] = useState<CreateProviderScore>({
    providerId: Number(id),
    score: 3,
    category: "",
    notes: "",
    evaluationDate: new Date().toISOString().split("T")[0],
  });
  const [scoreError, setScoreError] = useState("");

  const { data: provider, isLoading } = useQuery({
    queryKey: ["provider", id],
    queryFn: () => providerService.getProvider(Number(id)),
    enabled: !!id,
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
    setScoreForm({
      providerId: Number(id),
      score: 3,
      category: "",
      notes: "",
      evaluationDate: new Date().toISOString().split("T")[0],
    });
    setScoreError("");
  };

  const openEditScoreModal = (score: {
    id: number;
    score: number;
    category: string | null;
    notes: string | null;
  }) => {
    setEditingScoreId(score.id);
    setScoreForm({
      providerId: Number(id),
      score: score.score,
      category: score.category || "",
      notes: score.notes || "",
      evaluationDate: new Date().toISOString().split("T")[0],
    });
    setShowScoreModal(true);
  };

  const handleScoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scoreForm.score < 0 || scoreForm.score > 5) {
      setScoreError("Score must be between 0 and 5");
      return;
    }
    setScoreError("");
    if (editingScoreId) {
      updateScoreMutation.mutate({
        scoreId: editingScoreId,
        data: {
          score: scoreForm.score,
          category: scoreForm.category,
          notes: scoreForm.notes,
        },
      });
    } else {
      createScoreMutation.mutate(scoreForm);
    }
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
          <button
            className="btn btn-primary"
            onClick={() => setShowScoreModal(true)}
          >
            <MdAdd /> Add Score
          </button>
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
            <form onSubmit={handleScoreSubmit}>
              <div className="form-group">
                <label htmlFor="score">Score (0 - 5) *</label>
                <input
                  id="score"
                  type="number"
                  step="0.01"
                  min="0"
                  max="5"
                  className={`form-control ${scoreError ? "error" : ""}`}
                  value={scoreForm.score}
                  onChange={(e) =>
                    setScoreForm((prev) => ({
                      ...prev,
                      score: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
                {scoreError && <span className="error-text">{scoreError}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  className="form-control"
                  value={scoreForm.category || ""}
                  onChange={(e) =>
                    setScoreForm((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
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
                    value={scoreForm.evaluationDate || ""}
                    onChange={(e) =>
                      setScoreForm((prev) => ({
                        ...prev,
                        evaluationDate: e.target.value,
                      }))
                    }
                  />
                </div>
              )}
              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  className="form-control"
                  rows={3}
                  value={scoreForm.notes || ""}
                  onChange={(e) =>
                    setScoreForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
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
