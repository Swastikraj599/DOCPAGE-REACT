import React, { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Dashboard.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import i18n from "../i18n/i18n";
import apiService from "../services/api";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A020F0", "#8884D8"];

const Dashboard = () => {
  const [date, setDate] = useState(new Date());
  const [docData, setDocData] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [language, setLanguage] = useState("English");
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    loadDocuments();
  }, [user, navigate]);

  const loadDocuments = async () => {
    try {
      const docs = await apiService.getDocuments();
      setDocuments(docs);

      // Process data for pie chart
      const categoryCounts = docs.reduce((acc, doc) => {
        const category = doc.category_name || 'Others';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      const pieData = Object.entries(categoryCounts).map(([category, count]) => ({
        name: category,
        value: count,
      }));

      setDocData(pieData);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    setShowLanguageMenu(false);
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="logo">📄 <span>DocManager</span></div>
          <nav className="nav-links">
            <Link to="/assigned">📄 {t('assignedDocuments')}</Link>
            <Link to="/categories">📁 {t('documentCategories')}</Link>
            <Link to="/roles">👤 {t('assignedRoles')}</Link>
            <Link to="/permissions">🛡️ {t('permissions')}</Link>
          </nav>
        </div>
        <button className="logout-btn" onClick={handleLogout}>🔓 {t('signOut')}</button>
      </aside>

      <main className="main-content">
        {/* Top-right buttons */}
        <div className="top-right-buttons">
          {/* Notifications */}
          <div className="dropdown">
            <button
              className="icon-btn"
              title={t('notifications')}
              onClick={() => setShowNotifications(!showNotifications)}
            >🔔</button>
            {showNotifications && (
              <div className="dropdown-content">
                <p>{t('noNotifications') || 'No new notifications'}</p>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="dropdown">
            <button
              className="icon-btn"
              title={t('profile')}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >👤</button>
            {showProfileMenu && user && (
              <div className="dropdown-content">
                <p><strong>{user.first_name} {user.last_name}</strong></p>
                <p>{user.email}</p>
                <hr />
                <p>Roles: {user.roles?.map(r => r.name).join(', ') || 'None'}</p>
              </div>
            )}
          </div>

          {/* Language Selector */}
          <div className="dropdown">
            <button
              className="icon-btn"
              title={t('languagePreference')}
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            >🌐</button>
            {showLanguageMenu && (
              <div className="dropdown-content">
                <p onClick={() => handleLanguageSelect("English")}>English</p>
                <p onClick={() => handleLanguageSelect("Spanish")}>Spanish</p>
                <p onClick={() => handleLanguageSelect("French")}>French</p>
                <p onClick={() => handleLanguageSelect("German")}>German</p>
                <p onClick={() => handleLanguageSelect("Hindi")}>Hindi</p>
                <p onClick={() => handleLanguageSelect("Chinese")}>Chinese</p>
                <p onClick={() => handleLanguageSelect("Japanese")}>Japanese</p>
                <p onClick={() => handleLanguageSelect("Arabic")}>Arabic</p>
              </div>
            )}
          </div>
        </div>

        <h1>{t('dashboardTitle')}</h1>

        <div className="card-grid">
          <div className="card">
            <h2>{t('documentsByCategory')}</h2>
            {docData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={docData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {docData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ textAlign: 'center', marginTop: '1rem' }}>{t('noData')}</p>
            )}
          </div>

          <div className="card">
            <h2>{t('documentCalendar')}</h2>
            <Calendar
              onChange={setDate}
              value={date}
              className="calendar-widget"
              tileContent={({ date }) => {
                const count = documents.filter(
                  (doc) =>
                    new Date(doc.document_date).toDateString() === date.toDateString()
                ).length;

                return count > 0 ? (
                  <div className="calendar-badge">{count}</div>
                ) : null;
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;