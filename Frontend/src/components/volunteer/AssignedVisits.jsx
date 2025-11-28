// src/components/volunteer/AssignedVisits.jsx
import React, { useState } from "react";
import axios from "axios";

const AssignedVisits = ({ visits, setVisits }) => {
  const API_URL = "http://localhost:5000/";
  const [activeVisit, setActiveVisit] = useState(null); // visit being edited
  const [findingsInput, setFindingsInput] = useState("");

  const handleComplete = async (visitId) => {
    if (!findingsInput.trim()) {
      alert("Please enter findings before submitting.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.put(
        `${API_URL}visits/${visitId}/feedback`,
        { findings: findingsInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedVisit = res.data.visit;
      // update state
      setVisits((prev) =>
        prev.map((v) => (v.visit_id === updatedVisit.visit_id ? updatedVisit : v))
      );

      setActiveVisit(null);
      setFindingsInput("");
      alert("Visit marked as completed!");
    } catch (err) {
      console.error("Failed to submit findings", err);
      alert("Error submitting findings. Please try again.");
    }
  };

  return (
    <div className="dashboard-box visits-box">
      <h2>Your Assigned Visits</h2>
      {visits.length === 0 ? (
        <p>No visits assigned yet.</p>
      ) : (
        visits.map((visit) => (
          <div key={visit.visit_id} className="visit-card">
            <p><strong>Child/Application:</strong> {visit.child_name || visit.target_id}</p>
            <p><strong>Date:</strong> {new Date(visit.visit_date).toLocaleDateString()}</p>
            <p><strong>Status:</strong> {visit.status}</p>

            {visit.status !== "completed" ? (
              <>
                {activeVisit === visit.visit_id ? (
                  <div className="feedback-form">
                    <textarea
                      placeholder="Enter findings..."
                      value={findingsInput}
                      onChange={(e) => setFindingsInput(e.target.value)}
                    ></textarea>
                    <button onClick={() => handleComplete(visit.visit_id)}>
                      Submit & Mark Completed
                    </button>
                    <button onClick={() => setActiveVisit(null)}>Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setActiveVisit(visit.visit_id)}>
                    Add Findings & Complete
                  </button>
                )}
              </>
            ) : (
              <p><strong>Findings:</strong> {visit.findings}</p>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default AssignedVisits;
