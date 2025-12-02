// src/components/volunteer/VolunteerVisits.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./VolunteerVisits.css"; // Ensure you use the shared CSS or create a specific one

const VolunteerVisits = ({ volunteerId }) => {
  const [visits, setVisits] = useState([]);
  const API_URL = "http://localhost:5000/";

  const fetchCompletedVisits = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(`${API_URL}visits/volunteer/${volunteerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter STRICTLY for completed visits
      const completedData = res.data.visits.filter(
        (v) => v.status === "completed"
      );
      setVisits(completedData);
    } catch (err) {
      console.error("Error fetching completed visits:", err);
    }
  };

  useEffect(() => {
    if (volunteerId) fetchCompletedVisits();
  }, [volunteerId]);

  return (
    <div className="dashboard-box">
      <h2>Completed Visits History</h2>
      {visits.length === 0 ? (
        <p>No completed visits found.</p>
      ) : (
        visits.map((visit) => (
          <div key={visit.visit_id} className="visit-card completed-card">
            <p><strong>Target ID:</strong> {visit.target_id}</p>
            <p><strong>Date:</strong> {new Date(visit.visit_date).toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span className="status-badge success">{visit.status}</span></p>
            
            {visit.findings && (
              <p className="visit-report"><strong>Feedback:</strong> {visit.findings}</p>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default VolunteerVisits;