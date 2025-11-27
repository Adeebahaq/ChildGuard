// src/components/volunteer/VolunteerApprovalRequest.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./VolunteerApprovalRequest.css";

const VolunteerApprovalRequest = ({ volunteer, setVolunteer, setMessage }) => {
  const API_URL = "http://localhost:5000/";

  // Normalize availability to always have days array and time string
  const normalizeAvailability = (av) => {
    if (!av) return { days: [], time: "" };
    if (typeof av === "string") {
      try {
        av = JSON.parse(av);
      } catch {
        return { days: [], time: "" };
      }
    }
    return {
      days: Array.isArray(av.days) ? av.days : [],
      time: typeof av.time === "string" ? av.time : "",
    };
  };

  const [phone, setPhone] = useState(volunteer?.phone || "");
  const [area, setArea] = useState(volunteer?.area || "");
  const [availability, setAvailability] = useState(normalizeAvailability(volunteer?.availability));
  const [loading, setLoading] = useState(false);

  // Sync local state when volunteer prop updates
  useEffect(() => {
    setPhone(volunteer?.phone || "");
    setArea(volunteer?.area || "");
    setAvailability(normalizeAvailability(volunteer?.availability));
  }, [volunteer]);

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const timeSlots = ["Morning (9AM - 12PM)", "Afternoon (12PM - 3PM)", "Evening (3PM - 6PM)"];

  // Toggle selected days
  const toggleDay = (day, checked) => {
    const currentDays = Array.isArray(availability.days) ? availability.days : [];
    const newDays = checked ? [...currentDays, day] : currentDays.filter((d) => d !== day);
    setAvailability({ ...availability, days: newDays });
  };

  // Select a time slot
  const selectTime = (slot) => setAvailability({ ...availability, time: slot });

  // Send approval request
  const handleRequestApproval = async () => {
    if (!phone || !area || !availability.days.length || !availability.time) {
      alert("Please fill phone, area, and select availability.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");

      const res = await axios.post(
        `${API_URL}volunteer/${volunteer.volunteer_id}/request`,
        { phone, area, availability },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setVolunteer(res.data.volunteer);
      setMessage("Approval request sent to admin!");
    } catch (err) {
      console.error("Approval request failed:", err);
      const serverMsg = err.response?.data?.message || "Failed to send approval request.";
      setMessage(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-box approval-box">
      <h2>Request Admin Approval</h2>

      <div className="input-group">
        <label>Phone Number:</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter your phone number"
        />
      </div>

      <div className="input-group">
        <label>Area:</label>
        <input
          type="text"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          placeholder="Enter your area"
        />
      </div>

      <h3>Select Availability</h3>
      <div className="availability-grid days-grid">
        {daysOfWeek.map((day) => (
          <div key={day} className="checkbox-item">
            <input
              type="checkbox"
              checked={availability.days.includes(day)}
              onChange={(e) => toggleDay(day, e.target.checked)}
            />
            <label>{day}</label>
          </div>
        ))}
      </div>

      <div className="availability-grid">
        {timeSlots.map((slot) => (
          <div key={slot} className="checkbox-item">
            <input
              type="radio"
              name="time-slot"
              checked={availability.time === slot}
              onChange={() => selectTime(slot)}
            />
            <label>{slot}</label>
          </div>
        ))}
      </div>

      <button className="btn-primary" onClick={handleRequestApproval} disabled={loading}>
        {loading ? "Sending..." : "Request Approval"}
      </button>
    </div>
  );
};

export default VolunteerApprovalRequest;
