// src/components/volunteer/VolunteerVisits.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import "./VolunteerVisits.css";
const VolunteerVisits = ({ volunteerId, only }) => {
  const [visits, setVisits] = useState([]);

  const API_URL = "http://localhost:5000/";

  const fetchVisits = async () => {
    const token = localStorage.getItem("authToken");

    const res = await axios.get(`${API_URL}visits/volunteer/${volunteerId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    let data = res.data.visits;

    if (only === "pending") data = data.filter(v => v.status !== "completed");
    if (only === "completed") data = data.filter(v => v.status === "completed");

    setVisits(data);
  };

  useEffect(() => {
    if (volunteerId) fetchVisits();
  }, [volunteerId]);

  return (
    <div className="dashboard-box">
      <h2>{only === "completed" ? "Completed Visits" : "Assigned Visits"}</h2>

      {visits.length === 0 ? (
        <p>No visits found.</p>
      ) : (
        visits.map(visit => (
          <div key={visit.visit_id} className="visit-card">
            <p><strong>Target ID:</strong> {visit.target_id}</p>
            <p><strong>Date:</strong> {new Date(visit.visit_date).toLocaleDateString()}</p>
            <p><strong>Status:</strong> {visit.status}</p>

            {visit.findings && (
              <p><strong>Report:</strong> {visit.findings}</p>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default VolunteerVisits;
