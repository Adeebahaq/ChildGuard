import { Routes, Route } from 'react-router-dom';
import HomePage from "./pages/HomePage.jsx";
import VolunteerDashboard from "./pages/volunteer_dashboard.jsx"; 
import AdminAwarenessDashboard from "./pages/AdminAwarenessDashboard.jsx";  
import AdminVolunteerDashboard from "./pages/AdminVolunteerDashboard.jsx";  // ← ADDED (this was missing!)
import AdminDashboardHub from "./pages/AdminDashboardHub.jsx";  // ← ADDED: new admin landing page
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Default Home Page */}
        <Route path="/" element={<HomePage />} />

        {/* Admin/General Dashboard */}
        <Route path="/dashboard" element={<h1>Welcome to the Dashboard!</h1>} />

        {/* Volunteer Dashboard */}
        <Route
          path="/volunteer/:volunteerId/dashboard"
          element={<VolunteerDashboard />}
        />

        {/* Admin Awareness Content Management Dashboard */}
        <Route
          path="/admin/awareness"
          element={<AdminAwarenessDashboard />}
        />

        {/* ←←← NEW ROUTES ADDED BELOW ←←← */}

        {/* Admin Volunteer Management Dashboard - THIS WAS MISSING! */}
        <Route
          path="/admin/volunteers"
          element={<AdminVolunteerDashboard />}
        />

        {/* Admin main hub */}
        <Route
          path="/admin"
          element={<AdminDashboardHub />}   
        />

      </Routes>
    </div>
  );
}

export default App;