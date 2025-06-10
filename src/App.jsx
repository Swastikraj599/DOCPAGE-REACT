import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Hero from './components/Hero';
import Features from './components/Features';
import AuthModal from './components/AuthModal';
import Dashboard from './pages/Dashboard';
import DocumentCategories from './pages/DocumentCategories';
import { AuthProvider, useAuth } from './context/AuthContext';
import AssignedDocuments from './pages/AssignedDocuments';
import './i18n/i18n';
import { useNavigate } from 'react-router-dom';
import AssignedRoles from './pages/AssignedRoles';

const HomePage = ({ onLoginClick, onSignupClick, showLogin, showSignup, onClose, onSwitchMode }) => (
  <>
    <Hero onLoginClick={onLoginClick} onSignupClick={onSignupClick} />
    <Features />
    <AuthModal
      isOpen={showLogin || showSignup}
      isSignup={showSignup}
      onClose={onClose}
      onSwitchMode={onSwitchMode}
    />
  </>
);

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" />;
};

const AppContent = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <HomePage
            onLoginClick={() => setShowLogin(true)}
            onSignupClick={() => setShowSignup(true)}
            showLogin={showLogin}
            showSignup={showSignup}
            onClose={() => {
              setShowLogin(false);
              setShowSignup(false);
            }}
            onSwitchMode={() => {
              setShowSignup(!showSignup);
              setShowLogin(!showLogin);
            }}
          />
        }
      />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/categories"
        element={
          <PrivateRoute>
            <DocumentCategories />
          </PrivateRoute>
        }
      />

      <Route
        path="/assigned"
        element={
          <PrivateRoute>
            <AssignedDocuments />
          </PrivateRoute>
        }
      />

      <Route
        path="/roles"
        element={
          <PrivateRoute>
            <AssignedRoles />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;