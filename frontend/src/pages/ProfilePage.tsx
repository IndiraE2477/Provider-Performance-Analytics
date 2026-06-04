import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MdPerson, MdEdit, MdLock, MdSave } from "react-icons/md";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import { profileService } from "../services/profileService";
import { useAppSelector } from "../store";
import { selectAuth } from "../store/slices/authSlice";
import type { UpdateProfile, ChangePassword } from "../types";

const profileSchema = Yup.object({
  fullName: Yup.string().trim().required("Full name is required"),
  email: Yup.string()
    .trim()
    .required("Email is required")
    .email("Invalid email address"),
});

const passwordSchema = Yup.object({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string()
    .required("New password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmNewPassword: Yup.string()
    .required("Please confirm your new password")
    .oneOf([Yup.ref("newPassword")], "New passwords do not match"),
});

const ProfilePage: React.FC = () => {
  const queryClient = useQueryClient();
  const { fullName: authFullName } = useAppSelector(selectAuth);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: profileService.getProfile,
    staleTime: 30000,
  });

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
      passwordFormik.resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to change password");
    },
  });

  const profileFormik = useFormik({
    initialValues: { fullName: "", email: "" },
    validationSchema: profileSchema,
    enableReinitialize: true,
    validateOnMount: true,
    onSubmit: (values) => {
      updateMutation.mutate(values);
    },
  });

  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    validationSchema: passwordSchema,
    validateOnMount: true,
    onSubmit: (values) => {
      passwordMutation.mutate(values);
    },
  });

  useEffect(() => {
    if (profile && !isEditing) {
      profileFormik.setValues({
        fullName: profile.fullName,
        email: profile.email,
      });
    }
  }, [profile, isEditing]);

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
          <MdPerson />
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
            <form onSubmit={profileFormik.handleSubmit}>
              <div className="form-group">
                <label>
                  Full Name <span className="required-mark">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${profileFormik.touched.fullName && profileFormik.errors.fullName ? "error" : ""}`}
                  {...profileFormik.getFieldProps("fullName")}
                />
                {profileFormik.touched.fullName &&
                  profileFormik.errors.fullName && (
                    <span className="error-text">
                      {profileFormik.errors.fullName}
                    </span>
                  )}
              </div>
              <div className="form-group">
                <label>
                  Email <span className="required-mark">*</span>
                </label>
                <input
                  type="email"
                  className={`form-control ${profileFormik.touched.email && profileFormik.errors.email ? "error" : ""}`}
                  {...profileFormik.getFieldProps("email")}
                />
                {profileFormik.touched.email && profileFormik.errors.email && (
                  <span className="error-text">
                    {profileFormik.errors.email}
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!profileFormik.isValid || updateMutation.isPending}
                >
                  <MdSave />
                  {updateMutation.isPending ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsEditing(false);
                    profileFormik.setValues({
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
                <MdEdit /> Edit Profile
              </button>
            </>
          )}
        </div>

        <div className="chart-card">
          <h3 style={{ marginBottom: 16 }}>
            <MdLock />
            Change Password
          </h3>

          {showPasswordForm ? (
            <form onSubmit={passwordFormik.handleSubmit}>
              <div className="form-group">
                <label>
                  Current Password <span className="required-mark">*</span>
                </label>
                <input
                  type="password"
                  className={`form-control ${passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword ? "error" : ""}`}
                  {...passwordFormik.getFieldProps("currentPassword")}
                />
                {passwordFormik.touched.currentPassword &&
                  passwordFormik.errors.currentPassword && (
                    <span className="error-text">
                      {passwordFormik.errors.currentPassword}
                    </span>
                  )}
              </div>
              <div className="form-group">
                <label>
                  New Password <span className="required-mark">*</span>
                </label>
                <input
                  type="password"
                  className={`form-control ${passwordFormik.touched.newPassword && passwordFormik.errors.newPassword ? "error" : ""}`}
                  {...passwordFormik.getFieldProps("newPassword")}
                />
                {passwordFormik.touched.newPassword &&
                  passwordFormik.errors.newPassword && (
                    <span className="error-text">
                      {passwordFormik.errors.newPassword}
                    </span>
                  )}
              </div>
              <div className="form-group">
                <label>
                  Confirm New Password <span className="required-mark">*</span>
                </label>
                <input
                  type="password"
                  className={`form-control ${passwordFormik.touched.confirmNewPassword && passwordFormik.errors.confirmNewPassword ? "error" : ""}`}
                  {...passwordFormik.getFieldProps("confirmNewPassword")}
                />
                {passwordFormik.touched.confirmNewPassword &&
                  passwordFormik.errors.confirmNewPassword && (
                    <span className="error-text">
                      {passwordFormik.errors.confirmNewPassword}
                    </span>
                  )}
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    !passwordFormik.isValid || passwordMutation.isPending
                  }
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
                    passwordFormik.resetForm();
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
                <MdLock /> Change Password
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
