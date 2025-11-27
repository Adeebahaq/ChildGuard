// ==============================
// Parent Dashboard (4 Tabs Version)
// Tabs:
// 1. Register Family
// 2. Child Application (ParentChildren)
// 3. Fee Challans
// 4. Profile
// ==============================

// ---- ParentDashboard.jsx ----
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

import RegisterFamily from "../components/parent/parentFamilyRegistration.jsx";
import ParentChildren from "../components/parent/parentChildProfile.jsx";
import ParentChallans from "../components/parent/parentFeeChallan.jsx";

import "./parentDashboard.css";

const API_URL = "http://localhost:5000/api/";

const ParentDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const [activeTab, setActiveTab] = useState("family");

    const fetchParentProfile = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("authToken");

            const res = await axios.get(`${API_URL}parent/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {
                setProfile(res.data.data);
            } else {
                setMessage(res.data.message || "Failed to load parent profile.");
            }
        } catch (err) {
            console.error(err);
            setMessage("Error fetching dashboard data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchParentProfile();
    }, [fetchParentProfile]);

    if (loading) return <p className="text-center p-6">Loading dashboard...</p>;
    if (message) return <p className="text-center text-red-500 p-6">{message}</p>;

    return (
        <div className="parent-dashboard">
            <h1 className="main-title">Parent Dashboard</h1>

            {/* TABS */}
            <div className="dashboard-tabs">
                <button className={activeTab === "family" ? "active" : ""} onClick={() => setActiveTab("family")}>Register Family</button>
                <button className={activeTab === "children" ? "active" : ""} onClick={() => setActiveTab("children")}>Child Application</button>
                <button className={activeTab === "challans" ? "active" : ""} onClick={() => setActiveTab("challans")}>Fee Challans</button>
                <button className={activeTab === "profile" ? "active" : ""} onClick={() => setActiveTab("profile")}>Profile</button>
            </div>

            {/* TAB CONTENT */}
            {activeTab === "family" && (
                <RegisterFamily family={profile.family} onFamilyUpdated={fetchParentProfile} />
            )}

            {activeTab === "children" && (
                <ParentChildren family={profile.family} children={profile.children || []} onChildAdded={fetchParentProfile} />
            )}

            {activeTab === "challans" && (
                <ParentChallans familyId={profile.family?.family_id} />
            )}

            {activeTab === "profile" && (
                <div className="dashboard-box">
                    <h2>Parent Profile Summary</h2>
                    <p><b>Email:</b> {profile.parent.email}</p>
                    <p><b>User ID:</b> {profile.parent.user_id}</p>
                    <p><b>Role:</b> {profile.parent.role}</p>
                </div>
            )}
        </div>
    );
};

export default ParentDashboard;







