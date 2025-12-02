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
        <Link to="/admin/families" className="admin-card">
          <div className="card-header teal-header">Families</div>
          <h2>Parent Management</h2>
          <p>Approve family requests and assign volunteers to theri applications</p>
        </Link>

        {/* 3. Case Reports & Assignment */}
        <Link to="/admin/cases" className="admin-card">
          <div className="card-header teal-header">Case Reports</div>
          <h2>Vounteer Assignment</h2>
          <p>View reported cases and assign suitable volunteers based on availability</p>
        </Link>

        {/* 4. Sponsorships */}
        <Link to="/admin/sponsorships" className="admin-card">
          <div className="card-header teal-header">Sponsorships</div>
          <h2>Sponsor Management</h2>
          <p>Viewe sponsors and sponsored children</p>
        </Link>

        {/* 5. Awareness Content */}
        <Link to="/admin/awareness" className="admin-card">
          <div className="card-header teal-header">Awareness</div>
          <h2>Awareness Content Managment</h2>
          <p>Create and manage articles, images, videos, campaigns</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboardHub;