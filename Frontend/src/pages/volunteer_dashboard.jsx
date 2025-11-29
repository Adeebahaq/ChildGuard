// src/pages/VolunteerDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

import UserProfile from "../components/User/UserProfile";
import VolunteerAvailability from "../components/volunteer/VolunteerAvailability";
import VolunteerApprovalRequest from "../components/volunteer/VolunteerApprovalRequest";
import VolunteerVisits from "../components/volunteer/VolunteerVisits";

import "./volunteer_dashboard.css";

const VolunteerDashboard = () => {
  const { volunteerId } = useParams();
  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeSection, setActiveSection] = useState("profile"); // default section

  const API_URL = "http://localhost:5000/";

  const fetchVolunteerData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      const res = await axios.get(`${API_URL}volunteer/${volunteerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let vol = res.data.volunteer;

      if (vol.availability) {
        try {
          vol.availability = JSON.parse(vol.availability);
        } catch {
          vol.availability = { days: [], time: "" };
        }
      }

      setVolunteer(vol);

      // Automatically set section for pending volunteers
      if (vol.status === "pending") {
        setActiveSection("approval");
      }
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

  if (loading) return <p>Loading dashboard...</p>;
  if (!volunteer) return <p>{message || "No volunteer data found."}</p>;

  // If volunteer is in 'requested' status, show pending message
  if (volunteer.status === "requested") {
    return (
      <div className="volunteer-dashboard">
        <p>Your request is pending approval.</p>
      </div>
    );
  }

  return (
    <div className="volunteer-dashboard">
      {/* Clickable cards for sections */}
      {volunteer.status === "approved" && (
        <div className="dashboard-sections">
          <div
            className="section-card"
            onClick={() => setActiveSection("profile")}
          >
            Profile
          </div>
          <div
            className="section-card"
            onClick={() => setActiveSection("availability")}
          >
            Availability
          </div>
          <div
            className="section-card"
            onClick={() => setActiveSection("visits")}
          >
            Assigned Visits
          </div>
          <div
            className="section-card"
            onClick={() => setActiveSection("completed")}
          >
            Completed Visits
          </div>
        </div>
      )}

      {/* Render section content */}
      {volunteer.status === "pending" && activeSection === "approval" && (
        <VolunteerApprovalRequest
          volunteer={volunteer}
          setVolunteer={setVolunteer}
          setMessage={setMessage}
        />
      )}

      {volunteer.status === "approved" && activeSection === "profile" && (
        <UserProfile userId={volunteerId} />
      )}

      {volunteer.status === "approved" && activeSection === "availability" && (
        <VolunteerAvailability
          volunteer={volunteer}
          setVolunteer={setVolunteer}
        />
      )}

      {volunteer.status === "approved" && activeSection === "visits" && (
        <VolunteerVisits volunteerId={volunteer.volunteer_id} only="pending" />
      )}

      {volunteer.status === "approved" && activeSection === "completed" && (
        <VolunteerVisits
          volunteerId={volunteer.volunteer_id}
          only="completed"
        />
      )}
    </div>
  );
};

export default VolunteerDashboard;
