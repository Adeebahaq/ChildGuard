// src/App.jsx - FINAL VERSION WITH FAMILY MANAGEMENT DASHBOARD
import { Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Pages
import HomePage from "./pages/HomePage.jsx";
import VolunteerDashboard from "./pages/volunteer_dashboard.jsx";
import AdminAwarenessDashboard from "./pages/AdminAwarenessDashboard.jsx";
import AdminVolunteerDashboard from "./pages/AdminVolunteerDashboard.jsx";
import AdminDashboardHub from "./pages/AdminDashboardHub.jsx";
import AdminCasesDashboard from "./pages/AdminCasesDashboard.jsx";
import AdminFamilyDashboardHub from "./pages/AdminFamilyDashboardHub.jsx";     // Added
import AdminFamilyApproval from "./pages/AdminFamilyApproval.jsx";           // Added
import AdminFamilyAssignment from "./pages/AdminFamilyAssignment.jsx";       // Added
import ParentDashboard from "./pages/ParentDashboard.jsx";
import About from "./pages/About.jsx";

// Components
import NavBar from "./components/Navbar.jsx";
import UserProfile from "./components/User/UserProfile.jsx";
import VolunteerAvailability from "./components/volunteer/VolunteerAvailability.jsx";
import VolunteerVisits from "./components/volunteer/VolunteerVisits.jsx";

// Parent Components
import RegisterFamily from "./components/parent/parentFamilyRegistration.jsx";
import ParentChildren from "./components/parent/parentChildProfile.jsx";
import ParentChallans from "./components/parent/parentFeeChallan.jsx";

import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const id = localStorage.getItem('user_id');

    if (token && id) {
      setUser({ token, role: role || 'user', id });
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('token', userData.token);
    localStorage.setItem('role', userData.role || 'user');
    localStorage.setItem('user_id', userData.id);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate('/');
  };

  const openPanel = (tab) => {
    window.dispatchEvent(new CustomEvent('openAuthPanel', { detail: tab }));
  };

  // Parent Route Protection
  const ParentRoute = ({ children }) => {
    if (!user) return <Navigate to="/" replace />;
    if (user.role !== 'parent') {
      return (
        <div style={{ textAlign: 'center', marginTop: '100px', color: 'red' }}>
          <h2>Access Denied</h2>
          <p>Only parents can access this page.</p>
        </div>
      );
    }
    return children;
  };

  return (
    <div className="App">
      <NavBar user={user} onLogout={handleLogout} openPanel={openPanel} />
      
      <Routes>
        {/* Home */}
        <Route path="/" element={<HomePage user={user} onLogin={handleLoginSuccess} />} />
        <Route path="/about" element={<About />} />

        {/* General Dashboard */}
        <Route
          path="/dashboard"
          element={
            user && user.id ? (
              <div className="dashboard-container">
                <UserProfile userId={user.id} />
              </div>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Volunteer Routes */}
        <Route path="/volunteer/:volunteerId/dashboard" element={<VolunteerDashboard />} />
        <Route path="/volunteer/:volunteerId/availability" element={<VolunteerAvailabilityWrapper />} />
        <Route path="/volunteer/:volunteerId/visits" element={<VolunteerVisitsWrapper type="pending" />} />
        <Route path="/volunteer/:volunteerId/completed" element={<VolunteerVisitsWrapper type="completed" />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboardHub />} />
        <Route path="/admin/volunteers" element={<AdminVolunteerDashboard />} />
        <Route path="/admin/awareness" element={<AdminAwarenessDashboard />} />
        <Route path="/admin/cases" element={<AdminCasesDashboard />} />
        
        {/* FIXED: Old broken route → now redirects to new family hub */}
        <Route path="/admin/families" element={<Navigate to="/admin/family-hub" replace />} />

        {/* NEW: Family Management Hub & Sub-pages */}
        <Route path="/admin/family-hub" element={<AdminFamilyDashboardHub />} />
        <Route path="/admin/family-approval" element={<AdminFamilyApproval />} />
        <Route path="/admin/family-assignment" element={<AdminFamilyAssignment />} />

        {/* Parent Routes - Protected */}
        <Route path="/parent/dashboard" element={<ParentRoute><ParentDashboard /></ParentRoute>} />
        <Route path="/parent/register-family" element={<ParentRoute><RegisterFamily /></ParentRoute>} />
        <Route path="/parent/children" element={<ParentRoute><ParentChildren /></ParentRoute>} />
        <Route path="/parent/challans" element={<ParentRoute><ParentChallans /></ParentRoute>} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

// --- Wrapper Components ---
const VolunteerAvailabilityWrapper = () => {
  const { volunteerId } = useParams();
  return (
    <div className="dashboard-container">
      <VolunteerAvailability volunteerId={volunteerId} />
    </div>
  );
};

const VolunteerVisitsWrapper = ({ type }) => {
  const { volunteerId } = useParams();
  return (
    <div className="dashboard-container">
      <VolunteerVisits volunteerId={volunteerId} only={type} />
    </div>
  );
};

export default App;