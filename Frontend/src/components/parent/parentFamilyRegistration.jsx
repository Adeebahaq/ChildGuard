import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/parent/register-family";
const API_URL_FAMILY = "http://localhost:5000/api/families/my";

const RegisterFamily = () => {
  const [income, setIncome] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [cnic, setCnic] = useState(""); // ADDED: CNIC field
  const [proofDocuments, setProofDocuments] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [family, setFamily] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);

  // Fetch existing family data on mount
  useEffect(() => {
    const fetchFamily = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setFetchLoading(false);
          return;
        }

        const res = await axios.get(API_URL_FAMILY, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success && res.data.family) {
          setFamily(res.data.family);
          setIncome(res.data.family.income || "");
          setAddress(res.data.family.address || "");
        }
      } catch (err) {
        console.error("Error fetching family:", err);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchFamily();
  }, []);

  // Format CNIC as user types (xxxxx-xxxxxxx-x)
  const handleCnicChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove non-digits
    
    if (value.length > 13) {
      value = value.slice(0, 13);
    }
    
    // Format as xxxxx-xxxxxxx-x
    if (value.length > 5 && value.length <= 12) {
      value = value.slice(0, 5) + "-" + value.slice(5);
    } else if (value.length > 12) {
      value = value.slice(0, 5) + "-" + value.slice(5, 12) + "-" + value.slice(12);
    }
    
    setCnic(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Validate CNIC format
    const cnicDigits = cnic.replace(/\D/g, "");
    if (cnicDigits.length !== 13) {
      setMessage("CNIC must be 13 digits.");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("User not logged in.");
        setLoading(false);
        return;
      }

      // Prepare proof_documents as array if provided
      const proofDocsArray = proofDocuments
        ? proofDocuments.split(",").map(doc => doc.trim()).filter(Boolean)
        : [];

      const res = await axios.post(
        API_URL,
        {
          income: parseFloat(income),
          address,
          phone,
          cnic: cnicDigits, // Send CNIC without dashes
          proof_documents: proofDocsArray,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        setMessage("Family registration submitted successfully for verification.");
        setFamily(res.data.data);
      } else {
        setMessage(res.data.message || "Failed to register family.");
      }
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message || "Failed to register family. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="dashboard-box" style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-box" style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem' }}>
      <h2>Register Your Family</h2>

      {family && family.verification_status === 'verified' && (
        <div style={{ padding: '1rem', backgroundColor: '#d4edda', marginBottom: '1rem', borderRadius: '4px' }}>
          <p style={{ color: '#155724', margin: 0 }}>✓ Your family is verified and approved!</p>
        </div>
      )}

      {family && family.verification_status === 'pending' && (
        <div style={{ padding: '1rem', backgroundColor: '#fff3cd', marginBottom: '1rem', borderRadius: '4px' }}>
          <p style={{ color: '#856404', margin: 0 }}>⏳ Your application is pending verification.</p>
        </div>
      )}

      {family && family.verification_status === 'rejected' && (
        <div style={{ padding: '1rem', backgroundColor: '#f8d7da', marginBottom: '1rem', borderRadius: '4px' }}>
          <p style={{ color: '#721c24', margin: 0 }}>❌ Your application was rejected. Please contact admin.</p>
        </div>
      )}

      {family ? (
        <div style={{ padding: '1rem', backgroundColor: '#e7f3ff', borderRadius: '4px' }}>
          <h3>Current Family Information</h3>
          <p><strong>Income:</strong> Rs {family.income}</p>
          <p><strong>Address:</strong> {family.address}</p>
          <p><strong>Status:</strong> {family.verification_status}</p>
          <p><strong>Children Registered:</strong> {family.children_count || 0}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              CNIC Number <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="xxxxx-xxxxxxx-x"
              value={cnic}
              onChange={handleCnicChange}
              required
              maxLength="15"
              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <small style={{ color: '#666', fontSize: '0.875rem' }}>
              Enter 13-digit CNIC (format: xxxxx-xxxxxxx-x)
            </small>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Contact Number <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="tel"
              placeholder="e.g., 03001234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              pattern="[0-9]{11}"
              title="Please enter 11 digit phone number"
              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Monthly Income (PKR) <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="number"
              placeholder="e.g., 25000"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              required
              min="0"
              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Home Address <span style={{ color: 'red' }}>*</span>
            </label>
            <textarea
              placeholder="Enter complete address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              rows="3"
              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Proof Documents (Optional)
            </label>
            <input
              type="text"
              placeholder="Enter document names separated by commas (e.g., CNIC Copy, Salary Slip)"
              value={proofDocuments}
              onChange={(e) => setProofDocuments(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <small style={{ color: '#666', fontSize: '0.875rem' }}>
              Separate multiple documents with commas
            </small>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: '0.75rem 2rem', 
              fontSize: '1rem',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              width: '100%',
              fontWeight: 'bold'
            }}
          >
            {loading ? "Submitting..." : "Submit Family Application"}
          </button>
        </form>
      )}

      {message && (
        <div style={{ 
          marginTop: '1rem',
          padding: '1rem',
          borderRadius: '4px',
          backgroundColor: message.includes('success') ? '#d4edda' : '#f8d7da',
          color: message.includes('success') ? '#155724' : '#721c24',
          border: `1px solid ${message.includes('success') ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message}
        </div>
      )}

      {!family && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6' }}>
          <h4 style={{ marginTop: 0 }}>Important Notes:</h4>
          <ul style={{ marginBottom: 0, paddingLeft: '1.5rem' }}>
            <li>All fields marked with <span style={{ color: 'red' }}>*</span> are required</li>
            <li>CNIC must be valid 13-digit Pakistani CNIC</li>
            <li>Your application will be reviewed by admin</li>
            <li>Once approved, you can register your children</li>
            <li>You can only submit one family application</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default RegisterFamily;