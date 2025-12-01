import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "./parentDashboard.css";

const API_URL = "http://localhost:5000/api/parent";

const ParentDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    // Fetch parent profile
    const fetchParentProfile = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("authToken");
            if (!token) {
                navigate("/login");
                return;
            }

            const res = await axios.get(`${API_URL}/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {
                setProfile(res.data.data);
            } else {
                setMessage(res.data.message || "Failed to load profile.");
            }
        } catch (err) {
            console.error(err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                navigate("/login");
            } else {
                setMessage("Error fetching profile data.");
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchParentProfile();
    }, [fetchParentProfile]);

    const parentSections = [
        {
            title: "PARENT PROFILE",
            subtitle: "View Your Profile",
            description: "Check your personal details, email, phone number, and address.",
            link: "/parent/profile",
        },
        {
            title: "REGISTER FAMILY",
            subtitle: "Update Family Profile",
            description: "View and update your family registration details and address.",
            link: "/parent/register-family",
        },
        {
            title: "CHILD APPLICATION",
            subtitle: "Manage Child Profiles",
            description: "Add a new child, or view and manage existing child applications.",
            link: "/parent/children",
        },
        {
            title: "FEE CHALLANS",
            subtitle: "View Payment History",
            description: "Check and download fee challan forms and view payment status.",
            link: "/parent/challans",
        },
    ];

    const handleCardClick = (link) => navigate(link);

    if (loading) return <p className="text-center p-6">Loading dashboard...</p>;
    if (message) return <p className="text-center text-red-500 p-6">{message}</p>;

    return (
        <div className="parent-dashboard-final">
            {/* Welcome Header */}
            <div className="dashboard-header-card-style">
                <h1 className="welcome-title-card-style">Welcome, {profile?.parent?.username || "Parent"}!</h1>
                <p className="welcome-subtitle-card-style">Choose a management area</p>
            </div>

            {/* Card Layout */}
            <div className="dashboard-card-grid">
                {parentSections.map((section) => (
                    <div
                        key={section.title}
                        className="dashboard-card-style"
                        onClick={() => handleCardClick(section.link)}
                    >
                        <div className="card-oval-header-yellow">{section.title}</div>
                        <h3 className="card-subtitle-body">{section.subtitle}</h3>
                        <p className="card-description-body">{section.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ParentDashboard;
