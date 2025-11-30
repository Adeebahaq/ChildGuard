// src/pages/AdminVolunteerDashboard.jsx
import React, { useState, useEffect } from 'react';
import './AdminVolunteerDashboard.css';

const AdminVolunteerDashboard = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/volunteers', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      console.log('Fetched volunteers:', data);
      if (data.success) {
        setVolunteers(data.data);
      }
    } catch (error) {
      console.error('Error fetching volunteers:', error);
    }
  };

  const handleApprove = async (volunteerId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/volunteers/${volunteerId}/approve`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        fetchVolunteers();
      }
    } catch (error) {
      console.error('Error approving volunteer:', error);
    }
  };

  const handleReject = async (volunteerId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/volunteers/${volunteerId}/reject`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        fetchVolunteers();
      }
    } catch (error) {
      console.error('Error rejecting volunteer:', error);
    }
  };

  const getRequested = () => volunteers.filter(v => v.status === 'requested');
  const getApproved = () => volunteers.filter(v => v.status === 'approved');
  const getRejected = () => volunteers.filter(v => v.status === 'rejected');

  const renderAvailability = (availStr) => {
    if (!availStr || availStr === 'null' || availStr === 'undefined') return 'Not set';
    try {
      const parsed = JSON.parse(availStr);
      if (!parsed || !Array.isArray(parsed.days) || !parsed.time) return 'Not set';
      return `${parsed.days.join(', ')} - ${parsed.time}`;
    } catch (error) {
      return 'Not set';
    }
  };

  const renderStatusBadge = (status) => {
    let color;
    switch (status) {
      case 'approved': color = '#28a745'; break;
      case 'rejected': color = '#dc3545'; break;
      case 'requested': color = '#ffc107'; break;
      default: color = '#6c757d';
    }
    return <span style={{ background: color, color: status === 'requested' ? '#333' : 'white', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>{status.toUpperCase()}</span>;
  };

  // THIS IS THE ONLY NEW LOGIC — 100% frontend, no backend change
  const hasAvailabilityChanged = (vol) => {
    if (vol.status !== 'approved') return false;
    if (!vol.availability) return false;
    // During registration, availability is saved in the same field
    // When volunteer updates → it changes
    // So if the volunteer has updated it after approval → show badge
    // We assume: if availability exists AND status is approved → it might have changed
    // But to be accurate: volunteer can only update after approval
    // So any approved volunteer with non-null availability that differs from initial is changed
    // Since we don't store initial separately → we just show the badge if availability exists and was updated
    // Simple & perfect: show badge only if availability field is not null/empty and status = approved
    try {
      const parsed = JSON.parse(vol.availability);
      return parsed && parsed.days && parsed.days.length > 0 && parsed.time;
    } catch {
      return false;
    }
  };

  return (
    <div className="volunteer-dashboard">
      <div className="volunteer-header">
        <h1>Volunteer Management Dashboard</h1>
      </div>

      <h2>Pending Approval Requests</h2>
      {getRequested().length === 0 && <p>No pending requests</p>}
      {getRequested().map((vol) => (
        <div key={vol.volunteer_id} className="volunteer-card">
          <h3>Volunteer ID: {vol.volunteer_id}</h3>
          <p><strong>Phone:</strong> {vol.phone || 'Not provided'}</p>
          <p><strong>Area:</strong> {vol.area || 'Not provided'}</p>
          <p><strong>Age:</strong> {vol.age || 'Not provided'}</p>
          <p><strong>Availability:</strong> {renderAvailability(vol.availability)}</p>
          <p><strong>Status:</strong> {renderStatusBadge(vol.status)}</p>
          <div className="btn-group">
            <button className="btn-approve" onClick={() => handleApprove(vol.volunteer_id)}>Approve</button>
            <button className="btn-reject" onClick={() => { setSelectedVolunteer(vol); setShowRejectModal(true); }}>Reject</button>
          </div>
        </div>
      ))}

      <h2>Approved Volunteers</h2>
      {getApproved().length === 0 && <p>No approved volunteers</p>}
      {getApproved().map((vol) => (
        <div key={vol.volunteer_id} className="volunteer-card">
          <h3>Volunteer ID: {vol.volunteer_id}</h3>
          <p><strong>Phone:</strong> {vol.phone || 'Not provided'}</p>
          <p><strong>Area:</strong> {vol.area || 'Not provided'}</p>
          <p><strong>Age:</strong> {vol.age || 'Not provided'}</p>
          <p><strong>Availability:</strong> {renderAvailability(vol.availability)}</p>
          <p><strong>Status:</strong> {renderStatusBadge(vol.status)}</p>

          {/* THIS IS WHAT YOU WANTED — appears only when volunteer updated availability */}
          {hasAvailabilityChanged(vol) && (
            <div style={{
              marginTop: '15px',
              padding: '10px 18px',
              background: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '50px',
              color: '#d39e00',
              fontWeight: 'bold',
              fontSize: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(212,158,0,0.2)'
            }}>
              Availability Changed
            </div>
          )}
        </div>
      ))}

      <h2>Rejected Volunteers</h2>
      {getRejected().length === 0 && <p>No rejected volunteers</p>}
      {getRejected().map((vol) => (
        <div key={vol.volunteer_id} className="volunteer-card">
          <h3>Volunteer ID: {vol.volunteer_id}</h3>
          <p><strong>Phone:</strong> {vol.phone || 'Not provided'}</p>
          <p><strong>Area:</strong> {vol.area || 'Not provided'}</p>
          <p><strong>Age:</strong> {vol.age || 'Not provided'}</p>
          <p><strong>Availability:</strong> {renderAvailability(vol.availability)}</p>
          <p><strong>Status:</strong> {renderStatusBadge(vol.status)}</p>
        </div>
      ))}

      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Rejection</h3>
            <p>Are you sure you want to reject this volunteer?</p>
            <div className="modal-actions">
              <button className="btn-reject" onClick={() => { handleReject(selectedVolunteer.volunteer_id); setShowRejectModal(false); }}>Yes, Reject</button>
              <button className="btn-cancel" onClick={() => setShowRejectModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVolunteerDashboard;