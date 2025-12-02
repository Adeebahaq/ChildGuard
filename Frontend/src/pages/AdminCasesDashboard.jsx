// src/pages/AdminCasesDashboard.jsx  ← REPLACE FULL FILE
import React, { useState, useEffect } from 'react';
import './AdminCasesDashboard.css';

const AdminCasesDashboard = () => {
  const [reports, setReports] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningTo, setAssigningTo] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return alert('Login as admin first');

      const [repRes, volRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/reports', { 
          headers: { Authorization: `Bearer ${token}` } 
        }),
        fetch('http://localhost:5000/api/admin/volunteers', { 
          headers: { Authorization: `Bearer ${token}` } 
        })
      ]);

      const repData = await repRes.json();
      const volData = await volRes.json();

      if (repData.success) {
        setReports(repData.data || []); // Now includes verification_status
      }
      if (volData.success) {
        setVolunteers(volData.data.filter(v => v.status === 'approved' && v.area));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const assignVolunteer = async (reportId, volunteerId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/reports/${reportId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ volunteerId })
      });
      const data = await res.json();
      if (data.success) {
        setReports(prev => prev.map(r => 
          r.report_id === reportId 
            ? { ...r, assigned_volunteer_id: volunteerId, status: 'action_taken' }
            : r
        ));
        setAssigningTo(null);
      }
    } catch (err) {
      alert('Assignment failed');
    }
  };

  const getVolunteerName = (id) => {
    const v = volunteers.find(v => v.volunteer_id === id);
    return v ? `${v.volunteer_id.slice(-6)} — ${v.area}` : 'Unknown';
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="cases-page">
      <div className="page-header">
        <h1>Child Case Reports</h1>
        <p>Review & assign verified volunteers — same-area volunteers are mandatory when available</p>
      </div>

      <div className="cards-grid">
        {reports.length === 0 ? (
          <div className="empty">No reports submitted yet</div>
        ) : (
          reports.map(report => {
            const reportLocation = report.location?.trim().toLowerCase();
            const sameAreaVols = volunteers.filter(v => v.area?.trim().toLowerCase() === reportLocation);
            const availableVols = sameAreaVols.length > 0 ? sameAreaVols : volunteers;

            return (
              <div key={report.report_id} className="case-card">
                <div className="card-top">
                  <div className="child-info">
                    <h2>{report.child_name || 'Unnamed Child'}</h2>
                    <span className="age">{report.child_age ? `${report.child_age} years` : ''}</span>
                  </div>

                  <div className="status-group">
                    <span className={`status-badge ${report.status}`}>
                      {report.status.replace('_', ' ').toUpperCase()}
                    </span>

                    {/* THIS SHOWS THE BADGE */}
                    {report.verification_status && (
                      <span className={`verification-badge ${report.verification_status}`}>
                        {report.verification_status.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="card-body">
                  <p><strong>Location:</strong> {report.location}</p>
                  <p><strong>Description:</strong> {report.description}</p>
                  <p><strong>Reported:</strong> {new Date(report.reported_at).toLocaleString()}</p>
                </div>

                {report.assigned_volunteer_id ? (
                  <div className="assigned-box">
                    Assigned to: <strong>{getVolunteerName(report.assigned_volunteer_id)}</strong>
                  </div>
                ) : (
                  <div className="assign-box">
                    <button className="assign-trigger" onClick={() => setAssigningTo(report.report_id)}>
                      Assign Volunteer
                    </button>

                    {assigningTo === report.report_id && (
                      <div className="volunteer-dropdown">
                        <h4>
                          {sameAreaVols.length > 0
                            ? `Must assign from ${report.location}`
                            : `No ${report.location} volunteer — choose any`}
                        </h4>
                        {availableVols.map(v => (
                          <button
                            key={v.volunteer_id}
                            className={`vol-btn ${sameAreaVols.length > 0 && v.area?.toLowerCase() === reportLocation ? 'priority' : ''}`}
                            onClick={() => assignVolunteer(report.report_id, v.volunteer_id)}
                          >
                            {v.volunteer_id.slice(-6)} — {v.area}
                            {sameAreaVols.length > 0 && v.area?.toLowerCase() === reportLocation && ' (Required)'}
                          </button>
                        ))}
                        <button className="cancel-btn" onClick={() => setAssigningTo(null)}>Cancel</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminCasesDashboard;