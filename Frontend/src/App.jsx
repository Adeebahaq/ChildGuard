import { Routes, Route } from 'react-router-dom';
import HomePage from "./pages/HomePage.jsx";
import VolunteerDashboard from "./pages/volunteer_dashboard.jsx";
import ParentDashboard from "./pages/ParentDashboard.jsx"; 

// Admin routes
import AdminAwarenessDashboard from "./pages/AdminAwarenessDashboard.jsx";
import AdminVolunteerDashboard from "./pages/AdminVolunteerDashboard.jsx";
import AdminDashboardHub from "./pages/AdminDashboardHub.jsx";

import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>

        {/* Default Home Page */}
        <Route path="/" element={<HomePage />} />

        {/* General Dashboard */}
        <Route path="/dashboard" element={<h1>Welcome to the Dashboard!</h1>} />

        {/* Volunteer Dashboard */}
        <Route 
          path="/volunteer/:volunteerId/dashboard" 
          element={<VolunteerDashboard />} 
        />

        {/* Parent Dashboard */}
        <Route
          path="/parent/dashboard"
          element={<ParentDashboard />}
        />

        {/* Admin: Awareness Content Management */}
        <Route
          path="/admin/awareness"
          element={<AdminAwarenessDashboard />}
        />

        {/* Admin: Volunteer Management */}
        <Route
          path="/admin/volunteers"
          element={<AdminVolunteerDashboard />}
        />

        {/* Admin Main Hub */}
        <Route
          path="/admin"
          element={<AdminDashboardHub />}
        />

      </Routes>
    </div>
  );
}

export default App;
