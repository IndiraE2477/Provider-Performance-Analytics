import React from "react";
import { Outlet } from "react-router-dom";
import { MdNotifications } from "react-icons/md";
import Sidebar from "./Sidebar";

const Layout: React.FC = () => {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="top-navbar">
          <div className="navbar-left" />
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
