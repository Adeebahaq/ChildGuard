// ---- ParentFeeChallan.jsx ----
import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL_CHALLAN = "http://localhost:5000/api/parent/challans";

const ParentChallans = ({ familyId }) => {
    const [challans, setChallans] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!familyId) return;
        const fetch = async () => {
            try {
                const token = localStorage.getItem("authToken");
                const res = await axios.get(`${API_URL_CHALLAN}/${familyId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.data.success) setChallans(res.data.records);
            } catch {
                setMessage("Failed to fetch fee challans.");
            }
        };
        fetch();
    }, [familyId]);

    return (
        <div className="dashboard-box">
            <h2>Monthly Fee Challans</h2>

            {!familyId ? <p>No family registered.</p> : (
                challans.length === 0 ? <p>No challans issued yet.</p> : (
                    <ul>
                        {challans.map((c) => (
                            <li key={c.challan_id} className="challan-item">
                                <p><b>Month:</b> {c.month}</p>
                                <p><b>Amount:</b> Rs {c.amount}</p>
                                <p><b>Status:</b> {c.status}</p>
                            </li>
                        ))}
                    </ul>
                )
            )}

            {message && <p className="msg">{message}</p>}
        </div>
    );
};

export default ParentChallans;
