import { Routes, Route } from 'react-router-dom';
import HomePage from "./pages/HomePage.jsx";
import VolunteerDashboard from "./pages/volunteer_dashboard.jsx"; 
import ParentDashboard from "./pages/ParentDashboard.jsx"; 
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
         // app.jsx (Line 18)
         <Route
          path="/parent/dashboard" element={<ParentDashboard />} 
        />
      </Routes>
    </div>
  );
}

export default App;
