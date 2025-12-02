// src/pages/VolunteerDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

import VolunteerApprovalRequest from "../components/volunteer/VolunteerApprovalRequest";
import AssignedVisits from "../components/volunteer/AssignedVisits";
import VolunteerVisits from "../components/volunteer/VolunteerVisits";

import "./volunteer_dashboard.css";

const VolunteerDashboard = () => {
  const { volunteerId } = useParams();
  const navigate = useNavigate();
  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("tasks");

  const API_URL = "http://localhost:5000/";

  const fetchVolunteerData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      const res = await axios.get(`${API_URL}volunteer/${volunteerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let vol = res.data.volunteer;
      if (vol && vol.availability) {
        try {
          vol.availability = JSON.parse(vol.availability);
        } catch {
          vol.availability = { days: [], time: "" };
        }
      }
      setVolunteer(vol);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load volunteer data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (volunteerId) fetchVolunteerData();
  }, [volunteerId]);

  if (loading)
    return (
      <div className="volunteer-hub">
        <h1 className="hub-title">Volunteer Dashboard</h1>
        <p className="hub-subtitle">Loading your profile...</p>
        <div className="hub-cards centered-view">
          <div className="hub-card single-card">
            <div className="hub-badge">LOADING</div>
            <h2>Please Wait</h2>
            <p>We are fetching your dashboard details.</p>
          </div>
        </div>
      </div>
    );

  if (!volunteer)
    return (
      <div className="volunteer-hub">
        <h1 className="hub-title">Volunteer Dashboard</h1>
        <p className="hub-subtitle">Error Encountered</p>
        <div className="hub-cards centered-view">
          <div className="hub-card single-card">
            <div className="hub-badge">ERROR</div>
            <h2>No Data Found</h2>
            <p>{message || "We couldn't find your volunteer profile."}</p>
          </div>
        </div>
      </div>
    );

  if (volunteer.status === "requested") {
    return (
      <div className="volunteer-hub">
        <h1 className="hub-title">Volunteer Dashboard</h1>
        <p className="hub-subtitle">Application Status</p>
        <div className="hub-cards centered-view">
          <div className="hub-card single-card">
            <div className="hub-badge">STATUS</div>
            <h2>Pending Approval</h2>
            <p>
              Your application has been submitted successfully. Our administrators
              are currently reviewing your details. We will notify you once a
              decision is made.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (volunteer.status === "pending") {
    return (
      <div className="volunteer-hub">
        <VolunteerApprovalRequest
          volunteer={volunteer}
          setVolunteer={setVolunteer}
          setMessage={setMessage}
        />
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className="volunteer-hub">
      <h1 className="hub-title">Welcome, {volunteer.name || "Volunteer"}!</h1>
      <p className="hub-subtitle">Manage your volunteering activities</p>

      {/* Cards Grid */}
      <div className="hub-cards">
        {/* Card 1: Assigned Tasks */}
        <div
          className={`hub-card ${activeTab === "tasks" ? "active-card" : ""}`}
          onClick={() => setActiveTab("tasks")}
        >
          <div className="hub-badge">ASSIGNED</div>
          <h2>Current Tasks</h2>
          <p>View your upcoming visits, assigned cases, and active responsibilities.</p>
        </div>

        {/* Card 2: History */}
        <div
          className={`hub-card ${activeTab === "history" ? "active-card" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          <div className="hub-badge">HISTORY</div>
          <h2>Visit History</h2>
          <p>Review your past volunteer visits, completed reports, and case notes.</p>
        </div>

        {/* Card 3: Availability */}
        <div
          className={`hub-card ${activeTab === "availability" ? "active-card" : ""}`}
          onClick={() => navigate(`/volunteer/${volunteerId}/availability`)}
        >
          <div className="hub-badge">AVAILABILITY</div>
          <h2>My Schedule</h2>
          <p>Update your available days and times to help us assign you relevant tasks.</p>
        </div>
      </div>

      {/* Dynamic Content Panel */}
      <div className="dashboard-content-panel">
        {activeTab === "tasks" && (
          <div className="animate-fade-in">
            <AssignedVisits volunteerId={volunteerId} />
          </div>
        )}
        {activeTab === "history" && (
          <div className="animate-fade-in">
            <VolunteerVisits volunteerId={volunteerId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteerDashboard;