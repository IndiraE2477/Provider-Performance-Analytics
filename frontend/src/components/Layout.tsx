import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { MdSearch, MdNotifications, MdSettings } from 'react-icons/md';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const Layout: React.FC = () => {
  const { fullName, role } = useAuth();
  const navigate = useNavigate();
  const initials = fullName
    ? fullName.split(' ').map(n => n[0]).join('').toUpperCase()
    : '??';

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
            <button className="navbar-icon-btn" title="Settings">
              <MdSettings />
            </button>
            <div className="navbar-user" onClick={() => navigate('/profile')} title="My Profile">
              <div className="avatar">{initials}</div>
              <div>
                <div className="user-name">{fullName}</div>
                <div className="user-role">{role}</div>
              </div>
            </div>
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
