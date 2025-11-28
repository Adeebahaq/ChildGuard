// src/pages/AdminDashboardHub.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./AdminDashboardHub.css";

const AdminDashboardHub = () => {
  return (
    <div className="admin-hub">
      <h1>Welcome, Admin!</h1>
      <p className="hub-subtitle">Choose a management area</p>

      <div className="admin-cards">
        {/* 1. Volunteer Management */}
        <Link to="/admin/volunteers" className="admin-card">
          <div className="card-header teal-header">Volunteers</div>
          <h2>Volunteer Management</h2>
          <p>Approve, reject, and view all volunteer applications</p>
        </Link>

        {/* 2. Parent Applications */}
        <Link to="/admin/parents" className="admin-card">
          <div className="card-header teal-header">Parent Applications</div>
          <h2>View Parent Applications</h2>
          <p>Review and approve applications from parents seeking help</p>
        </Link>

        {/* 3. Case Reports & Assignment */}
        <Link to="/admin/cases" className="admin-card">
          <div className="card-header teal-header">Case Reports</div>
          <h2>Assign Volunteers to Cases</h2>
          <p>View reported cases and assign suitable volunteers based on availability</p>
        </Link>

        {/* 4. Sponsorships */}
        <Link to="/admin/sponsorships" className="admin-card">
          <div className="card-header teal-header">Sponsorships</div>
          <h2>Approve Sponsorships</h2>
          <p>Review and approve sponsorship requests and donations</p>
        </Link>

        {/* 5. Awareness Content */}
        <Link to="/admin/awareness" className="admin-card">
          <div className="card-header teal-header">Awareness</div>
          <h2>Awareness Content</h2>
          <p>Create and manage articles, images, videos, campaigns</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboardHub;