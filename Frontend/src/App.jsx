// src/App.jsx
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Pages
import HomePage from "./pages/HomePage.jsx";
import VolunteerDashboard from "./pages/volunteer_dashboard.jsx"; 
import AdminAwarenessDashboard from "./pages/AdminAwarenessDashboard.jsx";  
import AdminVolunteerDashboard from "./pages/AdminVolunteerDashboard.jsx";  
import AdminDashboardHub from "./pages/AdminDashboardHub.jsx";  
import About from "./pages/About.jsx"; // <-- Import About page

// Components
import NavBar from "./components/Navbar.jsx"; 
import UserProfile from "./components/User/UserProfile.jsx"; // Ensure default export

import './App.css';

function App() {
  const [user, setUser] = useState(null); 
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const id = localStorage.getItem('user_id');
    
    if (token) {
      setUser({ token, role, id }); 
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData); 
    localStorage.setItem('token', userData.token);
    if(userData.role) localStorage.setItem('role', userData.role);
    if(userData.id) localStorage.setItem('user_id', userData.id);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('role');
    setUser(null);
    navigate('/'); 
    alert("Signed out successfully");
  };

  const openPanel = (tab) => {
    const event = new CustomEvent('openAuthPanel', { detail: tab });
    window.dispatchEvent(event);
  };

  return (
    <div className="App">
      {/* NavBar */}
      <NavBar user={user} onLogout={handleLogout} openPanel={openPanel} />

      <Routes>
        <Route 
          path="/" 
          element={<HomePage user={user} onLogin={handleLoginSuccess} />} 
        />
        <Route 
          path="/dashboard" 
          element={
            user && user.id ? (
              <div className="dashboard-container">
                <UserProfile userId={user.id} />
              </div>
            ) : (
              <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <h2>Please Log In</h2>
                <p>You need to be logged in to view your profile.</p>
                <button onClick={() => openPanel('login')}>Login Now</button>
              </div>
            )
          } 
        />
        <Route path="/volunteer/:volunteerId/dashboard" element={<VolunteerDashboard />} />
        <Route path="/admin/awareness" element={<AdminAwarenessDashboard />} />
        <Route path="/admin/volunteers" element={<AdminVolunteerDashboard />} />
        <Route path="/admin" element={<AdminDashboardHub />} />
        <Route path="/about" element={<About />} /> {/* <-- About Us Route */}
         {/* Parent Dashboard */}
        <Route
          path="/parent/dashboard"
          element={<ParentDashboard />}
        />

      </Routes>
    </div>
  );
}

export default App;
