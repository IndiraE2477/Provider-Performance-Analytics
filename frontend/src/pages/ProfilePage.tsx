import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MdPerson, MdEdit, MdLock, MdSave } from "react-icons/md";
import { toast } from "react-toastify";
import { profileService } from "../services/profileService";
import { useAppSelector } from "../store";
import { selectAuth } from "../store/slices/authSlice";
import type { UpdateProfile, ChangePassword } from "../types";

const ProfilePage: React.FC = () => {
  const queryClient = useQueryClient();
  const { fullName: authFullName } = useAppSelector(selectAuth);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [profileForm, setProfileForm] = useState<UpdateProfile>({
    fullName: "",
    email: "",
  });
  const [passwordForm, setPasswordForm] = useState<ChangePassword>({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: profileService.getProfile,
    staleTime: 30000,
  });

  useEffect(() => {
    if (profile && !isEditing) {
      setProfileForm({ fullName: profile.fullName, email: profile.email });
    }
  }, [profile, isEditing]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfile) => profileService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated successfully");
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
    },
  });

  const passwordMutation = useMutation({
    mutationFn: (data: ChangePassword) => profileService.changePassword(data),
    onSuccess: () => {
      toast.success("Password changed successfully");
      setShowPasswordForm(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to change password");
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(profileForm);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    passwordMutation.mutate(passwordForm);
  };

  if (isLoading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="empty-state">
        <h3>Profile not found</h3>
      </div>
    );
  }

  const initials = profile.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div>
      <div className="page-header">
        <h1>
          <MdPerson style={{ verticalAlign: "middle", marginRight: 8 }} />
          My Profile
        </h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div className="chart-card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#4f46e5",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              {initials}
            </div>
            <div>
              <h2 style={{ margin: 0 }}>{profile.fullName}</h2>
              <span className="badge badge-active" style={{ marginTop: 4 }}>
                {profile.role}
              </span>
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleProfileSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={profileForm.fullName}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, fullName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, email: e.target.value })
                  }
                  required
                />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updateMutation.isPending}
                >
                  <MdSave style={{ verticalAlign: "middle", marginRight: 4 }} />
                  {updateMutation.isPending ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsEditing(false);
                    setProfileForm({
                      fullName: profile.fullName,
                      email: profile.email,
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div style={{ display: "grid", gap: 16 }}>
                <div>
                  <div
                    style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}
                  >
                    Username
                  </div>
                  <div style={{ fontWeight: 500 }}>{profile.username}</div>
                </div>
                <div>
                  <div
                    style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}
                  >
                    Email
                  </div>
                  <div style={{ fontWeight: 500 }}>{profile.email}</div>
                </div>
                <div>
                  <div
                    style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}
                  >
                    Member Since
                  </div>
                  <div style={{ fontWeight: 500 }}>
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div
                    style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}
                  >
                    Last Login
                  </div>
                  <div style={{ fontWeight: 500 }}>
                    {profile.lastLogin
                      ? new Date(profile.lastLogin).toLocaleString()
                      : "Never"}
                  </div>
                </div>
              </div>
              <button
                className="btn btn-primary"
                style={{ marginTop: 20 }}
                onClick={() => setIsEditing(true)}
              >
                <MdEdit style={{ verticalAlign: "middle", marginRight: 4 }} />{" "}
                Edit Profile
              </button>
            </>
          )}
        </div>

        <div className="chart-card">
          <h3 style={{ marginBottom: 16 }}>
            <MdLock style={{ verticalAlign: "middle", marginRight: 8 }} />
            Change Password
          </h3>

          {showPasswordForm ? (
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={passwordForm.confirmNewPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmNewPassword: e.target.value,
                    })
                  }
                  required
                  minLength={6}
                />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={passwordMutation.isPending}
                >
                  {passwordMutation.isPending
                    ? "Changing..."
                    : "Change Password"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordForm({
                      currentPassword: "",
                      newPassword: "",
                      confirmNewPassword: "",
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              <p style={{ color: "#64748b", marginBottom: 16 }}>
                Keep your account secure by regularly updating your password.
              </p>
              <button
                className="btn btn-secondary"
                onClick={() => setShowPasswordForm(true)}
              >
                <MdLock style={{ verticalAlign: "middle", marginRight: 4 }} />{" "}
                Change Password
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
