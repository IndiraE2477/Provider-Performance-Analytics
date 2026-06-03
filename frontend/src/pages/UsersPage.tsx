import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MdGroup, MdAdd, MdEdit, MdClose } from "react-icons/md";
import { toast } from "react-toastify";
import { userService } from "../services/userService";
import type { UserListItem, CreateUser, UpdateUser } from "../types";

const ROLES = [
  { id: 1, name: "Admin" },
  { id: 2, name: "Manager" },
  { id: 3, name: "Viewer" },
];

const UsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);

  const [createForm, setCreateForm] = useState<CreateUser>({
    username: "",
    email: "",
    fullName: "",
    password: "",
    roleId: 3,
  });

  const [editForm, setEditForm] = useState<UpdateUser>({
    fullName: "",
    email: "",
    roleId: 3,
    isActive: true,
  });

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: userService.getUsers,
    staleTime: 15000,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateUser) => userService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created successfully");
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create user");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUser }) =>
      userService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated successfully");
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update user");
    },
  });

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setCreateForm({
      username: "",
      email: "",
      fullName: "",
      password: "",
      roleId: 3,
    });
    setEditForm({ fullName: "", email: "", roleId: 3, isActive: true });
  };

  const openCreate = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const openEdit = (user: UserListItem) => {
    setEditingUser(user);
    setEditForm({
      fullName: user.fullName,
      email: user.email,
      roleId: user.roleId,
      isActive: user.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, data: editForm });
    } else {
      createMutation.mutate(createForm);
    }
  };

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
          <MdGroup style={{ verticalAlign: "middle", marginRight: 8 }} />
          User Management
        </h1>
        <button className="btn btn-primary" onClick={openCreate}>
          <MdAdd style={{ verticalAlign: "middle", marginRight: 4 }} /> Add User
        </button>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        <div className="kpi-card primary">
          <div className="kpi-content">
            <h3>Total Users</h3>
            <div className="value">{users?.length ?? 0}</div>
          </div>
        </div>
        <div className="kpi-card success">
          <div className="kpi-content">
            <h3>Active Users</h3>
            <div className="value">
              {users?.filter((u) => u.isActive).length ?? 0}
            </div>
          </div>
        </div>
        <div className="kpi-card warning">
          <div className="kpi-content">
            <h3>Inactive Users</h3>
            <div className="value">
              {users?.filter((u) => !u.isActive).length ?? 0}
            </div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users && users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td style={{ fontWeight: 600 }}>{user.username}</td>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>
                    <span
                      className={`badge ${
                        user.role === "Admin"
                          ? "badge-at-risk"
                          : user.role === "Manager"
                            ? "badge-inactive"
                            : "badge-active"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${user.isActive ? "badge-active" : "badge-at-risk"}`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleString()
                      : "—"}
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: "4px 10px", fontSize: 13 }}
                      onClick={() => openEdit(user)}
                    >
                      <MdEdit style={{ verticalAlign: "middle" }} /> Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={9}
                  style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 480 }}
          >
            <div className="modal-header">
              <h2>{editingUser ? "Edit User" : "Create User"}</h2>
              <button className="close-btn" onClick={closeModal}>
                <MdClose size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              {!editingUser && (
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    id="username"
                    type="text"
                    className="form-control"
                    value={createForm.username}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, username: e.target.value })
                    }
                    required
                  />
                </div>
              )}
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  className="form-control"
                  value={editingUser ? editForm.fullName : createForm.fullName}
                  onChange={(e) =>
                    editingUser
                      ? setEditForm({ ...editForm, fullName: e.target.value })
                      : setCreateForm({
                          ...createForm,
                          fullName: e.target.value,
                        })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  className="form-control"
                  value={editingUser ? editForm.email : createForm.email}
                  onChange={(e) =>
                    editingUser
                      ? setEditForm({ ...editForm, email: e.target.value })
                      : setCreateForm({ ...createForm, email: e.target.value })
                  }
                  required
                />
              </div>
              {!editingUser && (
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    className="form-control"
                    value={createForm.password}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, password: e.target.value })
                    }
                    required
                    minLength={6}
                  />
                </div>
              )}
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  className="form-control"
                  value={editingUser ? editForm.roleId : createForm.roleId}
                  onChange={(e) => {
                    const roleId = parseInt(e.target.value);
                    editingUser
                      ? setEditForm({ ...editForm, roleId })
                      : setCreateForm({ ...createForm, roleId });
                  }}
                >
                  {ROLES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              {editingUser && (
                <div className="form-group">
                  <label
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <input
                      type="checkbox"
                      checked={editForm.isActive}
                      onChange={(e) =>
                        setEditForm({ ...editForm, isActive: e.target.checked })
                      }
                    />
                    Active
                  </label>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  justifyContent: "flex-end",
                  marginTop: 20,
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : editingUser
                      ? "Update"
                      : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
