// ---- ParentChildren.jsx ----
import React, { useState } from "react";
import axios from "axios";
import "./parentChildProfile.css";

const API_URL_CHILD = "http://localhost:5000/api/parent/children";

const ParentChildren = ({ family, children, onChildAdded }) => {
    const [formData, setFormData] = useState({ name: "", age: "", gender: "male", needs: "", orphan_status: "none" });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const isEnrolled = family && family.application_status === "approved";

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const token = localStorage.getItem("authToken");
            const payload = { ...formData, age: parseInt(formData.age, 10) };

            const res = await axios.post(API_URL_CHILD, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {
                setMessage("Child registered successfully.");
                setFormData({ name: "", age: "", gender: "male", needs: "", orphan_status: "none" });
                onChildAdded();
            } else {
                setMessage(res.data.message);
            }
        } catch (err) {
            setMessage("Failed to register child.");
        }

        setLoading(false);
    };

    return (
        <div className="children-dashboard-box">
            <h2>Child Application</h2>

            {!isEnrolled && <p className="text-red-500">You must be approved before adding children.</p>}

            <form onSubmit={handleSubmit}>
                <input name="name" placeholder="Child Name" value={formData.name} onChange={handleChange} disabled={!isEnrolled} required />
                <input name="age" type="number" placeholder="Age" value={formData.age} onChange={handleChange} disabled={!isEnrolled} required />
                <select name="gender" value={formData.gender} onChange={handleChange} disabled={!isEnrolled}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>
                <select name="orphan_status" value={formData.orphan_status} onChange={handleChange} disabled={!isEnrolled}>
                    <option value="none">Not Orphan</option>
                    <option value="half">Half Orphan</option>
                    <option value="full">Full Orphan</option>
                </select>
                <textarea name="needs" placeholder="Special needs" value={formData.needs} onChange={handleChange} disabled={!isEnrolled}></textarea>
                <button type="submit" disabled={!isEnrolled || loading}>{loading ? "Saving..." : "Register Child"}</button>
            </form>

            {message && <p className="msg">{message}</p>}

            <h3>Registered Children</h3>
            {children.length === 0 ? <p>No children yet.</p> : (
                <div className="child-list">
                    {children.map((c) => (
                        <div key={c.child_id} className="child-card">
                            <p><b>Name:</b> {c.name}</p>
                            <p><b>Age:</b> {c.age}</p>
                            <p><b>Gender:</b> {c.gender}</p>
                            <p><b>Orphan Status:</b> {c.orphan_status}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ParentChildren;
