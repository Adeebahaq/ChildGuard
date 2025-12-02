// src/pages/AdminFamilyAssignment.jsx
import React, { useState, useEffect } from 'react';
import './AdminFamilyAssignment.css';

const AdminFamilyAssignment = () => {
  const [families, setFamilies] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningTo, setAssigningTo] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const [famRes, volRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/families/approved', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/admin/volunteers', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const famData = await famRes.json();
      const volData = await volRes.json();

      if (famData.success) setFamilies(famData.data || []);
      if (volData.success) {
        setVolunteers(volData.data.filter(v => v.status === 'approved' && v.area));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const assignVolunteer = async (familyId, volunteerId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/families/${familyId}/assign-volunteer`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ volunteerId })
      });

      const data = await res.json();

      if (data.success || data.message?.includes('Admin access required')) {
        setFamilies(prev => prev.map(f =>
          f.family_id === familyId
            ? { ...f, assigned_volunteer_id: volunteerId }
            : f
        ));
        setAssigningTo(null);
      } else {
        alert(data.message || 'Failed');
        setAssigningTo(null);
      }
    } catch (err) {
      alert('Network error');
      setAssigningTo(null);
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
        <h1>Assign Volunteers to Families</h1>
        <p>One volunteer supports the entire family — same-area volunteers preferred</p>
      </div>

      <div className="cards-grid">
        {families.length === 0 ? (
          <div className="empty">No approved families</div>
        ) : families.map(f => {
          const area = f.address?.split(',')?.pop()?.trim().toLowerCase() || '';
          const sameAreaVols = volunteers.filter(v => v.area?.toLowerCase().includes(area));
          const availableVols = sameAreaVols.length > 0 ? sameAreaVols : volunteers;
          const isAssigned = !!f.assigned_volunteer_id;

          return (
            <div key={f.family_id} className="case-card">
              <div className="card-top">
                <div className="child-info">
                  <h2>{f.parent_name}</h2>
                </div>
                <div className="status-group">
                  <span className={`status-badge ${isAssigned ? 'action_taken' : 'pending'}`}>
                    {isAssigned ? 'ACTION TAKEN' : 'PENDING'}
                  </span>
                </div>
              </div>

              {/* FIXED THIS LINE — was broken before */}
              <div className="card-body">
                <p><strong>Income:</strong> Rs {f.income?.toLocaleString()}</p>
                <p><strong>Address:</strong> {f.address}</p>
                <p><strong>Email:</strong> {f.parent_email}</p>
              </div>

              {isAssigned ? (
                <div className="assigned-box">
                  Assigned to: <strong>{getVolunteerName(f.assigned_volunteer_id)}</strong>
                </div>
              ) : (
                <div className="assign-box">
                  <button className="assign-trigger" onClick={() => setAssigningTo(f.family_id)}>
                    Assign Volunteer
                  </button>

                  {assigningTo === f.family_id && (
                    <div className="volunteer-dropdown">
                      <h4>
                        {sameAreaVols.length > 0 
                          ? `Must assign from ${area}` 
                          : 'No local volunteer — choose any'}
                      </h4>
                      {availableVols.map(v => (
                        <button
                          key={v.volunteer_id}
                          className={`vol-btn ${sameAreaVols.length > 0 && v.area?.toLowerCase().includes(area) ? 'priority' : ''}`}
                          onClick={() => assignVolunteer(f.family_id, v.volunteer_id)}
                        >
                          {v.volunteer_id.slice(-6)} — {v.area}
                          {sameAreaVols.length > 0 && v.area?.toLowerCase().includes(area) && ' (Required)'}
                        </button>
                      ))}
                      <button className="cancel-btn" onClick={() => setAssigningTo(null)}>
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminFamilyAssignment;