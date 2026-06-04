import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  MdDashboard,
  MdPeople,
  MdLogout,
  MdAssessment,
  MdAdminPanelSettings,
  MdError,
  MdGroup,
  MdSmartToy,
} from "react-icons/md";
import { useAppSelector, useAppDispatch } from "../store";
import { selectAuth, logout as logoutAction } from "../store/slices/authSlice";

const Sidebar: React.FC = () => {
  const { fullName, role } = useAppSelector(selectAuth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAdmin = role === "Admin";
  const isManager = role === "Manager";
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    dispatch(logoutAction());
    navigate("/login");
  };

  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "??";

  const roleLabel = isAdmin
    ? "Admin Console"
    : isManager
      ? "Manager Console"
      : "Performance Dashboard";

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Provider Analytics</h2>
        <p>{roleLabel}</p>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">Main</div>
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <MdDashboard /> Dashboard
        </NavLink>
        <NavLink
          to="/providers"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <MdPeople /> Providers
        </NavLink>
        <NavLink
          to="/analytics"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <MdAssessment /> Analytics
        </NavLink>
        {(isAdmin || isManager) && (
          <NavLink
            to="/ai-insights"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <MdSmartToy /> AI Insights
          </NavLink>
        )}
        {isAdmin && (
          <>
            <div className="nav-section">Administration</div>
            <NavLink
              to="/audit-logs"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <MdAdminPanelSettings /> Audit Logs
            </NavLink>
            <NavLink
              to="/error-logs"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <MdError /> Error Logs
            </NavLink>
            <NavLink
              to="/users"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <MdGroup /> Users
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div
            className="user-profile-link"
            onClick={() => navigate("/profile")}
            title="My Profile"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              cursor: "pointer",
              flex: 1,
              minWidth: 0,
            }}
          >
            <div className="user-avatar">{initials}</div>
            <div className="user-details">
              <div className="name">{fullName}</div>
              <div className="role">{role}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <MdLogout size={20} />
          </button>
        </div>
      </div>

      {showLogoutModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowLogoutModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Logout</h3>
            <p style={{ margin: "16px 0", fontSize: 20, color: "#000000" }}>
              <b>
                Are you sure you want to log out? You will need to sign in again
                to access your account.
              </b>
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowLogoutModal(false)}
              >
                No
              </button>
              <button className="btn btn-danger" onClick={confirmLogout}>
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
