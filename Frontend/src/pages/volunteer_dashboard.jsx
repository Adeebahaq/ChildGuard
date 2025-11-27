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
  const [activeTab, setActiveTab] = useState("profile"); // default tab

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

      // Automatically set tab for pending volunteers
      if (vol.status === "pending") {
        setActiveTab("approval");
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

  return (
    <div className="volunteer-dashboard">
      {/* Show message if status is requested but not approved */}
      {volunteer.status === "requested" && (
        <p>Your request is pending approval.</p>
      )}

      {/* Tabs */}
      <div className="dashboard-tabs">
        {volunteer.status === "pending" && (
          <button
            className={activeTab === "approval" ? "active" : ""}
            onClick={() => setActiveTab("approval")}
          >
            Request Approval
          </button>
        )}

        {volunteer.status === "approved" && (
          <>
            <button
              className={activeTab === "profile" ? "active" : ""}
              onClick={() => setActiveTab("profile")}
            >
              Profile
            </button>

            <button
              className={activeTab === "availability" ? "active" : ""}
              onClick={() => setActiveTab("availability")}
            >
              Availability
            </button>

            <button
              className={activeTab === "visits" ? "active" : ""}
              onClick={() => setActiveTab("visits")}
            >
              Assigned Visits
            </button>

            <button
              className={activeTab === "completed" ? "active" : ""}
              onClick={() => setActiveTab("completed")}
            >
              Completed Visits
            </button>
          </>
        )}
      </div>

      {/* Render tab content */}
      {volunteer.status === "pending" && activeTab === "approval" && (
        <VolunteerApprovalRequest
          volunteer={volunteer}
          setVolunteer={setVolunteer}
          setMessage={setMessage}
        />
      )}

      {volunteer.status === "approved" && activeTab === "profile" && (
        <UserProfile userId={volunteerId} />
      )}

      {volunteer.status === "approved" && activeTab === "availability" && (
        <VolunteerAvailability
          volunteer={volunteer}
          setVolunteer={setVolunteer}
        />
      )}

      {volunteer.status === "approved" && activeTab === "visits" && (
        <VolunteerVisits volunteerId={volunteer.volunteer_id} only="pending" />
      )}

      {volunteer.status === "approved" && activeTab === "completed" && (
        <VolunteerVisits
          volunteerId={volunteer.volunteer_id}
          only="completed"
        />
      )}
    </div>
  );
};

export default VolunteerDashboard;
