// ---- ParentChildren.jsx ----
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./parentChildProfile.css";

const API_URL = "http://localhost:5000/api/";
const PROFILE_URL = `${API_URL}parent/profile`;
const API_URL_CHILD = `${API_URL}parent/children`;

const ParentChildren = () => {
    const [formData, setFormData] = useState({ 
        name: "", 
        age: "", 
        gender: "male", 
        needs: "", 
        orphan_status: "none",
        bform_no: "", // Required Field 
        class: "", 	// Required Field
    });
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    
    const [family, setFamily] = useState(null);
    const [children, setChildren] = useState([]);

    const fetchParentProfile = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const res = await axios.get(PROFILE_URL, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data.success) {
                setFamily(res.data.data.family);
                setChildren(res.data.data.children || []);
            } else {
                setMessage(res.data.message || "Failed to load parent data.");
            }
        } catch (err) {
            console.error("Error fetching parent profile:", err);
            setMessage("Error fetching dashboard data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchParentProfile();
    }, [fetchParentProfile]);

    const isEnrolled = family && family.verification_status === "verified";

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === "age") {
            const numValue = parseInt(value, 10);

            // 1. If the input is empty or contains only non-numeric characters, allow it (the type="number" should largely handle non-numerics)
            if (value === "") {
                setFormData({ ...formData, [name]: value });
                return;
            }
            
            // 2. Check if the value is a valid number AND if it's within the 5-18 range.
            // We check against the string length to allow typing '1' before '10', '11', etc.
            if (!isNaN(numValue) && numValue <= 18) {
                 // Allow typing any single digit, or a number up to 18.
                 setFormData({ ...formData, [name]: value });
                 setMessage(""); // Clear any previous error message

            } else if (!isNaN(numValue) && numValue > 18) {
                // If they type a number > 18 (like 19 or 20), snap it back to 18
                setFormData({ ...formData, [name]: "18" });
                setMessage("Age cannot exceed 18.");
            }
            // Ignore if input is a number less than 5, but allow if it starts with a valid character
            else if (numValue < 5 && numValue >= 1 && value.length >= 1) {
                // Prevent single digit ages below 5, like 1, 2, 3, 4. 
                // Set to min age (5) to force compliance.
                setFormData({ ...formData, [name]: "5" });
                setMessage("Minimum age is 5.");
            }
            
            return;
        }

        setFormData({ ...formData, [name]: value });
    };
    const handleSubmit = async (e) => { // <-- handleSubmit is defined here!
        e.preventDefault();
        setIsSubmitting(true);
        setMessage("");

        const ageValue = parseInt(formData.age, 10);
        
        // --- 1. FRONTEND QUICK VALIDATION ---

        if (!formData.bform_no || !formData.class) {
             setMessage("B-Form Number and Class/Grade are required.");
             setIsSubmitting(false);
             return;
        }
        
        // Age Check: must be between 5 and 18 (redundant if using min/max/handleChange, but good safety)
        if (isNaN(ageValue) || ageValue < 5 || ageValue > 18) {
            setMessage("Child age must be between 5 and 18 years.");
            setIsSubmitting(false);
            return; 
        }
        
        try {
            const token = localStorage.getItem("authToken");
            // Use the parsed and validated age
            const payload = { ...formData, age: ageValue }; 

            const res = await axios.post(API_URL_CHILD, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {
                setMessage("Child registered successfully.");
                // Reset form data
                setFormData({ 
                    name: "", 
                    age: "", 
                    gender: "male", 
                    needs: "", 
                    orphan_status: "none",
                    bform_no: "", 
                    class: "",    
                });
                fetchParentProfile(); // Refresh list
            } else {
                setMessage(res.data.message);
            }
        } catch (err) {
            // Check for server-side validation error message
            const errMsg = err.response?.data?.message || "Failed to register child. Check console for details.";
            setMessage(errMsg);
            console.error(err);
        }

        setIsSubmitting(false);
    }; // <-- End of handleSubmit

    if (loading) return <div className="children-dashboard-box">Loading child profiles...</div>;

    return (
        <div className="children-dashboard-box">
            <h2>Child Application</h2>

            {!isEnrolled && <p className="text-red-500">You must have an verified family application before adding children.</p>}
            
            <form onSubmit={handleSubmit}> {/* <-- handleSubmit is referenced here */}
                <input name="name" placeholder="Child Name" value={formData.name} onChange={handleChange} disabled={!isEnrolled} required />
                
                {/* Age Input with min/max and no-spin class */}
                <input 
                    name="age" 
                    type="number" 
                    placeholder="Age (5-18)" 
                    value={formData.age} 
                    onChange={handleChange} 
                    disabled={!isEnrolled} 
                    required 
                    className="no-spin" 
                    min="5" // Enforce minimum age
                    max="18" // Enforce maximum age
                />
                
                <select name="gender" value={formData.gender} onChange={handleChange} disabled={!isEnrolled} required>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </select>
                
                {/* B-Form No is now REQUIRED */}
                <input 
                    name="bform_no" 
                    placeholder="B-Form No (Required)" 
                    value={formData.bform_no} 
                    onChange={handleChange} 
                    disabled={!isEnrolled} 
                    required 
                />
                
                {/* Class is now REQUIRED */}
                <input 
                    name="class" 
                    placeholder="Class/Grade (Required)" 
                    value={formData.class} 
                    onChange={handleChange} 
                    disabled={!isEnrolled} 
                    required 
                />

                <select name="orphan_status" value={formData.orphan_status} onChange={handleChange} disabled={!isEnrolled}>
                    <option value="none">Not Orphan</option>
                    <option value="father_orphan">Father Orphan</option>
                    <option value="mother_orphan">Mother Orphan</option>
                    <option value="full_orphan">Full Orphan</option>
                </select>
                <textarea name="needs" placeholder="Special needs or requirements (JSON)" value={formData.needs} onChange={handleChange} disabled={!isEnrolled}></textarea>
                <button type="submit" disabled={!isEnrolled || isSubmitting}>{isSubmitting ? "Saving..." : "Register Child"}</button>
            </form>

            {message && <p className="msg">{message}</p>}

            <h3>Registered Children ({children.length})</h3>
            {children.length === 0 ? <p>No children registered yet.</p> : (
                <div className="child-list">
                    {children.map((c) => (
                        <div key={c.child_id} className="child-card">
                            <p><b>Name:</b> {c.name}</p>
                            <p><b>Age:</b> {c.age}</p>
                            <p><b>Gender:</b> {c.gender}</p>
                            <p><b>B-Form No:</b> {c.bform_no}</p>
                            <p><b>Class:</b> {c.class}</p>
                            <p><b>Orphan Status:</b> {c.orphan_status}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ParentChildren;