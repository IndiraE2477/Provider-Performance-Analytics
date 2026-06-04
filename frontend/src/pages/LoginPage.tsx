import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { MdLock, MdEmail } from "react-icons/md";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "../store";
import { loginAsync, selectAuth } from "../store/slices/authSlice";

const loginSchema = Yup.object({
  email: Yup.string()
    .trim()
    .required("Email is required")
    .email("Invalid email address"),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(selectAuth);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: loginSchema,
    validateOnMount: true,
    onSubmit: async (values) => {
      const result = await dispatch(loginAsync(values));
      if (loginAsync.fulfilled.match(result)) {
        toast.success(`Welcome back, ${result.payload.fullName}!`);
        navigate("/dashboard");
      } else {
        toast.error(
          (result.payload as string) || "Login failed. Please try again.",
        );
      }
    },
  });

  return (
    <div className="login-page">
      <div className="login-card">
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
            }}
          >
            <MdLock size={28} color="#fff" />
          </div>
        </div>
        <h1>Provider Performance</h1>
        <p className="subtitle">Analytics Dashboard</p>

        <form onSubmit={formik.handleSubmit}>
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

          <div className="form-group">
            <label htmlFor="password">
              <MdLock />
              Password <span className="required-mark">*</span>
            </label>
            <input
              id="password"
              type="password"
              className={`form-control ${formik.touched.password && formik.errors.password ? "error" : ""}`}
              placeholder="Enter your password"
              {...formik.getFieldProps("password")}
              autoComplete="current-password"
            />
            {formik.touched.password && formik.errors.password && (
              <span className="error-text">{formik.errors.password}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={!formik.isValid || loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* <div
          style={{
            marginTop: 24,
            padding: 16,
            background: "#f8fafc",
            borderRadius: 8,
            fontSize: 13,
            color: "#64748b",
          }}
        >
          <strong>Demo Credentials:</strong>
          <br />
          Admin: admin@provideranalytics.com / Admin@123
          <br />
          Manager: manager@provideranalytics.com / Admin@123
          <br />
          Viewer: viewer@provideranalytics.com / Admin@123
        </div> */}

        <p
          style={{
            textAlign: "center",
            marginTop: 20,
            fontSize: 14,
            color: "#64748b",
          }}
        >
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{
              color: "#4f46e5",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
