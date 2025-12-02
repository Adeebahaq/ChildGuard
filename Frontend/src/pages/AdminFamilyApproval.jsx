// src/pages/AdminFamilyApproval.jsx
import React, { useState, useEffect } from 'react';
import './AdminFamilyApproval.css'; 

const AdminFamiliesApproval = () => {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFamilies();
  }, []);

  const fetchFamilies = async () => {
    try {
      const token = localStorage.getItem('token');
      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/families/requested', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/admin/families/approved', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/admin/families/rejected', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const pendingData = await pendingRes.json();
      const approvedData = await approvedRes.json();
      const rejectedData = await rejectedRes.json();

      const allFamilies = [
        ...(pendingData.success ? pendingData.data : []).map(f => ({ ...f, verification_status: 'pending' })),
        ...(approvedData.success ? approvedData.data : []).map(f => ({ ...f, verification_status: 'verified' })),
        ...(rejectedData.success ? rejectedData.data : []).map(f => ({ ...f, verification_status: 'rejected' }))
      ];

      setFamilies(allFamilies);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching families:', error);
      setLoading(false);
    }
  };

  const handleApprove = async (familyId) => {
    if (!confirm('Approve this family?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/admin/families/${familyId}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFamilies();
    } catch (error) {
      console.error('Error approving family:', error);
    }
  };

  const handleReject = async (familyId) => {
    if (!confirm('Reject this family?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/admin/families/${familyId}/reject`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFamilies();
    } catch (error) {
      console.error('Error rejecting family:', error);
    }
  };

  const renderStatusBadge = (status) => {
    let color, text;
    switch (status) {
      case 'pending':
        color = '#ffc107';
        text = 'REQUESTED';
        break;
      case 'verified':
        color = '#28a745';
        text = 'APPROVED';
        break;
      case 'rejected':
        color = '#dc3545';
        text = 'REJECTED';
        break;
      default:
        color = '#6c757d';
        text = 'UNKNOWN';
    }
    return (
      <span style={{
        background: color,
        color: status === 'pending' ? '#333' : 'white',
        padding: '6px 16px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 'bold',
        display: 'inline-block'
      }}>
        {text}
      </span>
    );
  };

  const getPending = () => families.filter(f => f.verification_status === 'pending');
  const getApproved = () => families.filter(f => f.verification_status === 'verified');
  const getRejected = () => families.filter(f => f.verification_status === 'rejected');

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', fontSize: '1.2rem' }}>Loading families...</div>;

  return (
    <div className="volunteer-dashboard">
      <div className="volunteer-header">
        <h1>Family Management Dashboard</h1>
      </div>

      {/* PENDING REQUESTS */}
      <h2>Pending Approval Requests</h2>
      {getPending().length === 0 && <p style={{ color: '#666', fontStyle: 'italic' }}>No pending family requests</p>}
      {getPending().map((fam) => (
        <div key={fam.family_id} className="volunteer-card">
          <h3>Family ID: {fam.family_id}</h3>
          <p><strong>Parent:</strong> {fam.parent_name || 'Unknown'}</p>
          <p><strong>Email:</strong> {fam.parent_email || 'Not provided'}</p>
          <p><strong>Income:</strong> Rs {fam.income?.toLocaleString() || 'Not provided'}</p>
          <p><strong>Address:</strong> {fam.address || 'Not provided'}</p>
          <p><strong>Status:</strong> {renderStatusBadge('pending')}</p>
          <div className="btn-group">
            <button className="btn-approve" onClick={() => handleApprove(fam.family_id)}>Approve</button>
            <button className="btn-reject" onClick={() => handleReject(fam.family_id)}>Reject</button>
          </div>
        </div>
      ))}

      {/* APPROVED FAMILIES */}
      <h2>Approved Families</h2>
      {getApproved().length === 0 && <p style={{ color: '#666', fontStyle: 'italic' }}>No approved families</p>}
      {getApproved().map((fam) => (
        <div key={fam.family_id} className="volunteer-card">
          <h3>Family ID: {fam.family_id}</h3>
          <p><strong>Parent:</strong> {fam.parent_name || 'Unknown'}</p>
          <p><strong>Email:</strong> {fam.parent_email || 'Not provided'}</p>
          <p><strong>Income:</strong> Rs {fam.income?.toLocaleString() || 'Not provided'}</p>
          <p><strong>Address:</strong> {fam.address || 'Not provided'}</p>
          <p><strong>Status:</strong> {renderStatusBadge('verified')}</p>
        </div>
      ))}

      {/* REJECTED FAMILIES */}
      <h2>Rejected Families</h2>
      {getRejected().length === 0 && <p style={{ color: '#666', fontStyle: 'italic' }}>No rejected families</p>}
      {getRejected().map((fam) => (
        <div key={fam.family_id} className="volunteer-card">
          <h3>Family ID: {fam.family_id}</h3>
          <p><strong>Parent:</strong> {fam.parent_name || 'Unknown'}</p>
          <p><strong>Email:</strong> {fam.parent_email || 'Not provided'}</p>
          <p><strong>Income:</strong> Rs {fam.income?.toLocaleString() || 'Not provided'}</p>
          <p><strong>Address:</strong> {fam.address || 'Not provided'}</p>
          <p><strong>Status:</strong> {renderStatusBadge('rejected')}</p>
        </div>
      ))}
    </div>
  );
};

export default AdminFamiliesApproval;