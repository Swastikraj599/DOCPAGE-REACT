// src/components/Layout.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import "../pages/Dashboard.css"; // reuse existing styles

const Layout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="logo">📄 <span>DocManager</span></div>
          <nav className="nav-links">
            <Link to="/dashboard">📊 Dashboard</Link>
            <Link to="/assigned">📄 Assigned Documents</Link>
            <Link to="/categories">📁 Document Categories</Link>
            <Link to="/roles">👤 Assigned Roles</Link>
            <Link to="/permissions">🛡️ Permissions</Link>
          </nav>
        </div>
        <button className="logout-btn" onClick={handleLogout}>🔓 Sign Out</button>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
