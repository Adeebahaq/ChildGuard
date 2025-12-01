import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL_CHALLAN = "http://localhost:5000/api/parent/challans"; // FIXED: Correct endpoint

const ParentChallans = () => {
    const [challans, setChallans] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChallans = async () => {
            try {
                const token = localStorage.getItem("token"); // FIXED: Use 'token' not 'authToken'
                if (!token) {
                    setMessage("Please log in to view challans.");
                    setLoading(false);
                    return;
                }

                // FIXED: Remove familyId from URL - backend gets it from token
                const res = await axios.get(API_URL_CHALLAN, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.data.success) {
                    setChallans(res.data.challans || []);
                } else {
                    setMessage(res.data.message || "Failed to fetch challans.");
                }
            } catch (err) {
                console.error(err);
                setMessage(err.response?.data?.message || "Failed to fetch fee challans.");
            } finally {
                setLoading(false);
            }
        };

        fetchChallans();
    }, []);

    const handleMarkPaid = async (challanId) => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.patch(
                `${API_URL_CHALLAN}/${challanId}/paid`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                setMessage("Challan marked as paid successfully.");
                // Refresh challans
                setChallans(prev => 
                    prev.map(c => 
                        c.challan_id === challanId 
                            ? { ...c, status: 'paid' } 
                            : c
                    )
                );
            } else {
                setMessage(res.data.message || "Failed to mark challan as paid.");
            }
        } catch (err) {
            console.error(err);
            setMessage(err.response?.data?.message || "Failed to update challan.");
        }
    };

    if (loading) {
        return <div className="dashboard-box" style={{ textAlign: 'center', padding: '2rem' }}>
            Loading challans...
        </div>;
    }

    return (
        <div className="dashboard-box" style={{ maxWidth: '900px', margin: '2rem auto', padding: '2rem' }}>
            <h2>Monthly Fee Challans</h2>

            {message && <p className="msg" style={{ 
                padding: '1rem', 
                marginBottom: '1rem',
                backgroundColor: message.includes('success') ? '#d4edda' : '#f8d7da',
                color: message.includes('success') ? '#155724' : '#721c24',
                borderRadius: '4px'
            }}>{message}</p>}

            {challans.length === 0 ? (
                <p>No challans issued yet.</p>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {challans.map((c) => (
                        <div 
                            key={c.challan_id} 
                            className="challan-item" 
                            style={{ 
                                border: '1px solid #ddd', 
                                padding: '1.5rem', 
                                borderRadius: '8px',
                                backgroundColor: c.status === 'paid' ? '#d4edda' : '#fff',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <div>
                                <p style={{ margin: '0.25rem 0' }}>
                                    <b>Month:</b> {c.month}
                                </p>
                                <p style={{ margin: '0.25rem 0' }}>
                                    <b>Amount:</b> Rs {c.amount}
                                </p>
                                <p style={{ margin: '0.25rem 0' }}>
                                    <b>Status:</b> 
                                    <span style={{ 
                                        marginLeft: '0.5rem',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '4px',
                                        backgroundColor: c.status === 'paid' ? '#155724' : '#856404',
                                        color: 'white',
                                        fontSize: '0.875rem'
                                    }}>
                                        {c.status.toUpperCase()}
                                    </span>
                                </p>
                                {c.due_date && (
                                    <p style={{ margin: '0.25rem 0' }}>
                                        <b>Due Date:</b> {new Date(c.due_date).toLocaleDateString()}
                                    </p>
                                )}
                            </div>

                            {c.status === 'pending' && (
                                <button
                                    onClick={() => handleMarkPaid(c.challan_id)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        backgroundColor: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Mark as Paid
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ParentChallans;