import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  MdPerson,
  MdEmail,
  MdLock,
  MdBadge,
  MdSecurity,
  MdLocalHospital,
} from "react-icons/md";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import { authService } from "../services/authService";
import type { ProviderListItem } from "../types";

const registerSchema = Yup.object({
  username: Yup.string()
    .trim()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters")
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ),
  fullName: Yup.string().trim().required("Full name is required"),
  email: Yup.string()
    .trim()
    .required("Email is required")
    .email("Invalid email address"),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[^a-zA-Z0-9]/,
      "Password must contain at least one special character",
    ),
  confirmPassword: Yup.string()
    .required("Please confirm your password")
    .oneOf([Yup.ref("password")], "Passwords do not match"),
  roleId: Yup.number().required("Role is required"),
  providerId: Yup.number()
    .nullable()
    .when("roleId", {
      is: 3,
      then: (schema) =>
        schema.required("Please select a provider for Viewer role"),
      otherwise: (schema) => schema.nullable(),
    }),
});

const RegisterPage: React.FC = () => {
  const [providers, setProviders] = useState<ProviderListItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    authService
      .getProviders()
      .then(setProviders)
      .catch(() => {});
  }, []);

  const formik = useFormik({
    initialValues: {
      username: "",
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      roleId: 3,
      providerId: null as number | null,
    },
    validationSchema: registerSchema,
    validateOnMount: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await authService.register({
          username: values.username,
          email: values.email,
          fullName: values.fullName,
          password: values.password,
          confirmPassword: values.confirmPassword,
          roleId: values.roleId,
          providerId: values.roleId === 3 ? values.providerId : null,
        });
        toast.success("Registration successful! Please sign in.");
        navigate("/login");
      } catch (error: any) {
        const message =
          error.response?.data?.message ||
          "Registration failed. Please try again.";
        const serverErrors: string[] = error.response?.data?.errors || [];
        if (serverErrors.length > 0) {
          toast.error(serverErrors.join(". "));
        } else {
          toast.error(message);
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="login-page">
      <div className="login-card register-card">
        <h1>Create Account</h1>
        <p className="subtitle">Register to access Provider Analytics</p>

        <form onSubmit={formik.handleSubmit}>
          <div className="register-form-grid">
            <div className="form-group">
              <label htmlFor="username">
                <MdPerson />
                Username <span className="required-mark">*</span>
              </label>
              <input
                id="username"
                type="text"
                className={`form-control ${formik.touched.username && formik.errors.username ? "error" : ""}`}
                placeholder="Choose a username"
                {...formik.getFieldProps("username")}
                autoComplete="username"
              />
              {formik.touched.username && formik.errors.username && (
                <span className="error-text">{formik.errors.username}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="fullName">
                <MdBadge />
                Full Name <span className="required-mark">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                className={`form-control ${formik.touched.fullName && formik.errors.fullName ? "error" : ""}`}
                placeholder="Enter your full name"
                {...formik.getFieldProps("fullName")}
                autoComplete="name"
              />
              {formik.touched.fullName && formik.errors.fullName && (
                <span className="error-text">{formik.errors.fullName}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">
              <MdEmail />
              Email <span className="required-mark">*</span>
            </label>
            <input
              id="email"
              type="email"
              className={`form-control ${formik.touched.email && formik.errors.email ? "error" : ""}`}
              placeholder="Enter your email"
              {...formik.getFieldProps("email")}
              autoComplete="email"
            />
            {formik.touched.email && formik.errors.email && (
              <span className="error-text">{formik.errors.email}</span>
            )}
          </div>

          <div className="register-form-grid">
            <div className="form-group">
              <label htmlFor="password">
                <MdLock />
                Password <span className="required-mark">*</span>
              </label>
              <input
                id="password"
                type="password"
                className={`form-control ${formik.touched.password && formik.errors.password ? "error" : ""}`}
                placeholder="Create a password"
                {...formik.getFieldProps("password")}
                autoComplete="new-password"
              />
              {formik.touched.password && formik.errors.password && (
                <span className="error-text">{formik.errors.password}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                <MdLock />
                Confirm Password <span className="required-mark">*</span>
              </label>
              <input
                id="confirmPassword"
                type="password"
                className={`form-control ${formik.touched.confirmPassword && formik.errors.confirmPassword ? "error" : ""}`}
                placeholder="Confirm your password"
                {...formik.getFieldProps("confirmPassword")}
                autoComplete="new-password"
              />
              {formik.touched.confirmPassword &&
                formik.errors.confirmPassword && (
                  <span className="error-text">
                    {formik.errors.confirmPassword}
                  </span>
                )}
            </div>
          </div>

          <div className="register-form-grid">
            <div className="form-group">
              <label htmlFor="roleId">
                <MdSecurity />
                Role <span className="required-mark">*</span>
              </label>
              <select
                id="roleId"
                className="form-control"
                value={formik.values.roleId}
                onChange={(e) => {
                  formik.setFieldValue("roleId", Number(e.target.value));
                  formik.setFieldValue("providerId", null);
                }}
                onBlur={formik.handleBlur}
              >
                <option value={1}>Admin</option>
                <option value={2}>Manager</option>
                <option value={3}>Viewer</option>
              </select>
            </div>

            {formik.values.roleId === 3 && (
              <div className="form-group">
                <label htmlFor="providerId">
                  <MdLocalHospital />
                  Provider <span className="required-mark">*</span>
                </label>
                <select
                  id="providerId"
                  className={`form-control ${formik.touched.providerId && formik.errors.providerId ? "error" : ""}`}
                  value={formik.values.providerId ?? ""}
                  onChange={(e) =>
                    formik.setFieldValue(
                      "providerId",
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                  onBlur={formik.handleBlur}
                >
                  <option value="">Select a provider</option>
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.specialty}
                    </option>
                  ))}
                </select>
                {formik.touched.providerId && formik.errors.providerId && (
                  <span className="error-text">{formik.errors.providerId}</span>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={formik.isSubmitting || !formik.isValid || !formik.dirty}
          >
            {formik.isSubmitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: 20,
            fontSize: 14,
            color: "#64748b",
          }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "#4f46e5",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Sign in
          </Link>
        </p>

        <div
          style={{
            marginTop: 16,
            padding: 12,
            background: "#f0fdf4",
            borderRadius: 8,
            fontSize: 12,
            color: "#166534",
          }}
        >
          <strong>Note:</strong> Select the appropriate role for your account.
          Admins have full access, Managers can manage providers, Viewers have
          read-only access.
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
