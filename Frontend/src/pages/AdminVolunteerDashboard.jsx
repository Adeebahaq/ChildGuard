// src/pages/AdminVolunteerDashboard.jsx   
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import "./AdminAwarenessDashboard.css"; // you can reuse or rename later, it's fine for now

const API_URL = "http://localhost:5000/api/admin";

const AdminVolunteerDashboard = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("authToken");

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/volunteers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVolunteers(res.data.data);
    } catch (err) {
      toast.error("Failed to load volunteers");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const handleApprove = async (volunteer_id) => {
    if (!window.confirm("Approve this volunteer?")) return;

    try {
      await axios.patch(
        `${API_URL}/volunteers/${volunteer_id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Volunteer approved!");
      fetchVolunteers();
    } catch (err) {
      toast.error("Failed to approve");
    }
  };

  const handleReject = async (volunteer_id) => {
    if (!window.confirm("Reject this volunteer?")) return;

    try {
      await axios.patch(
        `${API_URL}/volunteers/${volunteer_id}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Volunteer rejected");
      fetchVolunteers();
    } catch (err) {
      toast.error("Failed to reject");
    }
  };

  const filtered = volunteers.filter(v =>
    v.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.phone && v.phone.includes(searchTerm))
  );

  const getStatusBadge = (status) => {
    const colors = {
      requested: "#ffc107",
      approved: "#28a745",
      rejected: "#dc3545",
      pending: "#6c757d",
    };
    return (
      <span style={{
        padding: "6px 12px",
        borderRadius: "20px",
        backgroundColor: colors[status] || "#ccc",
        color: "white",
        fontSize: "12px",
        fontWeight: "bold",
      }}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading) return <div className="loading">Loading volunteers...</div>;

  return (
    <div className="admin-volunteer-dashboard">
      <Toaster position="top-right" />

      <h1>Volunteer Management</h1>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="volunteer-table-container">
        <table className="volunteer-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Area</th>
              <th>Availability</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => (
              <tr key={v.volunteer_id}>
                <td><strong>{v.username}</strong></td>
                <td>{v.email}</td>
                <td>{v.phone || "-"}</td>
                <td>{v.area || "-"}</td>
                <td>
                  {v.availability ? (
                    <div>
                      {v.availability.days?.join(", ")}<br />
                      <small>{v.availability.time}</small>
                    </div>
                  ) : "-"}
                </td>
                <td>{getStatusBadge(v.status)}</td>
                <td>
                  {v.status === "requested" && (
                    <>
                      <button
                        onClick={() => handleApprove(v.volunteer_id)}
                        className="btn-approve"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(v.volunteer_id)}
                        className="btn-reject"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {v.status === "rejected" && <small>Can re-apply</small>}
                  {v.status === "approved" && "Active"}
                  {v.status === "pending" && "Not applied yet"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p style={{ textAlign: "center", padding: "40px", color: "#666" }}>
            No volunteers found.
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminVolunteerDashboard;