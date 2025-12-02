// src/pages/AdminFamilyDashboardHub.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboardHub.css"; // Reuse your existing beautiful hub styles

const AdminFamilyDashboardHub = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-hub">
      <h1>Family Management</h1>
      <p className="hub-subtitle">Choose an action to manage families</p>

      <div className="admin-cards" style={{ gap: "40px", justifyContent: "center" }}>
        {/* 1. Approve/Reject Family Requests */}
        <div 
          className="admin-card" 
          onClick={() => navigate('/admin/family-approval')}
          style={{ cursor: "pointer" }}
        >
          <div className="card-header teal-header">Approval</div>
          <h2>Family Approval</h2>
          <p>Review, approve, or reject family registration requests</p>
        </div>

        {/* 2. Assign Volunteers to Approved Families */}
        <div 
          className="admin-card" 
          onClick={() => navigate('/admin/family-assignment')}
          style={{ cursor: "pointer" }}
        >
          <div className="card-header teal-header">Assignment</div>
          <h2>Volunteer Assignment</h2>
          <p>Assign a volunteer to support approved families (same-area priority)</p>
        </div>
      </div>

      {/* Back Button */}
      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <button 
          onClick={() => navigate('/admin')} 
          style={{
            padding: "12px 30px",
            background: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "50px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          ← Back to Main Admin Hub
        </button>
      </div>
    </div>
  );
};

export default AdminFamilyDashboardHub;