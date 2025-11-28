import React, { useState, useEffect } from "react";
import axios from "axios";
import "./VolunteerApprovalRequest.css";

const VolunteerApprovalRequest = ({ volunteer, setVolunteer, setMessage }) => {
  const API_URL = "http://localhost:5000/";

  const normalizeAvailability = (av) => {
    if (!av) return { days: [], time: "" };
    if (typeof av === "string") {
      try { av = JSON.parse(av); } catch { return { days: [], time: "" }; }
    }
    return {
      days: Array.isArray(av.days) ? av.days : [],
      time: typeof av.time === "string" ? av.time : "",
    };
  };

  const [phone, setPhone] = useState(volunteer?.phone || "");
  const [area, setArea] = useState(volunteer?.area || "");
  const [age, setAge] = useState(volunteer?.age || 18);   // <-- added age state
  const [availability, setAvailability] = useState(normalizeAvailability(volunteer?.availability));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPhone(volunteer?.phone || "");
    setArea(volunteer?.area || "");
    setAge(volunteer?.age || 18);                           // <-- sync age
    setAvailability(normalizeAvailability(volunteer?.availability));
  }, [volunteer]);

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const timeSlots = ["Morning (9AM - 12PM)", "Afternoon (12PM - 3PM)", "Evening (3PM - 6PM)"];

  const toggleDay = (day, checked) => {
    const currentDays = Array.isArray(availability.days) ? availability.days : [];
    const newDays = checked ? [...currentDays, day] : currentDays.filter((d) => d !== day);
    setAvailability({ ...availability, days: newDays });
  };

  const selectTime = (slot) => setAvailability({ ...availability, time: slot });

  const handleRequestApproval = async () => {
    if (!phone || !area || !availability.days.length || !availability.time || !age) {
      alert("Please fill phone, area, age, and select availability.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");

      const res = await axios.post(
        `${API_URL}volunteer/${volunteer.volunteer_id}/request`,
        { phone, area, age, availability },   // <-- send age
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

      <div className="input-group">
        <label>Age:</label>
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
          min={18}                       // <-- enforce minimum age
          placeholder="Enter your age"
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
