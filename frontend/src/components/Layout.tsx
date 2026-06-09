import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { MdSearch, MdNotifications } from "react-icons/md";
import Sidebar from "./Sidebar";
import { useAppSelector } from "../store";
import { selectAuth } from "../store/slices/authSlice";

const Layout: React.FC = () => {
  const { isAuthenticated } = useAppSelector(selectAuth);
  const navigate = useNavigate();

  useEffect(() => {
    const handlePopState = () => {
      if (!isAuthenticated) {
        navigate("/login", { replace: true });
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isAuthenticated, navigate]);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="top-navbar">
          <div className="navbar-left">
            <div className="navbar-search">
              <MdSearch />
              <input type="text" placeholder="Search providers, analytics..." />
            </div>
          </div>
          <div className="navbar-right">
            <button className="navbar-icon-btn" title="Notifications">
              <MdNotifications />
              <span className="notification-dot" />
            </button>
          </div>
        </div>
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
