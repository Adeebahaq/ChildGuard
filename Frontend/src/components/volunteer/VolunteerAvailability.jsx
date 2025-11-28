// src/components/volunteer/VolunteerAvailability.jsx
import React, { useState, useEffect } from "react";
import "./VolunteerAvailability.css";
const VolunteerAvailability = ({ volunteer, setVolunteer }) => {
  const API_URL = "http://localhost:5000/";

  // Initialize availability safely
  const [availability, setAvailability] = useState({ days: [], time: "" });

  useEffect(() => {
    if (!volunteer) return;

    let avail = { days: [], time: "" };
    try {
      if (volunteer.availability) {
        avail =
          typeof volunteer.availability === "string"
            ? JSON.parse(volunteer.availability)
            : volunteer.availability;
      }
    } catch (err) {
      console.warn("Failed to parse volunteer availability:", err);
    }
    setAvailability(avail);
  }, [volunteer]);

  // Update backend
  const updateAvailability = async () => {
    if (!volunteer) {
      alert("Volunteer data not loaded yet!");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token found");

      const res = await fetch(
        `${API_URL}volunteer/${volunteer.volunteer_id}/availability`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(availability),
        }
      );

      if (!res.ok) throw new Error("Failed to update availability");

      const data = await res.json();
      setVolunteer(data.volunteer); // update parent state
      alert("Availability saved!");
    } catch (err) {
      console.error("Error saving availability:", err);
      alert(err instanceof Error ? err.message : "Failed to save availability");
    }
  };

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const timeSlots = [
    "Morning (9AM - 12PM)",
    "Afternoon (12PM - 3PM)",
    "Evening (3PM - 6PM)",
  ];

  // Toggle a day in availability
  const toggleDay = (day, checked) => {
    const newDays = checked
      ? [...availability.days, day]
      : availability.days.filter((d) => d !== day);
    const newAvail = { ...availability, days: newDays };
    setAvailability(newAvail);
    setVolunteer({ ...volunteer, availability: newAvail }); // sync with parent
  };

  // Select time slot
  const selectTime = (slot) => {
    const newAvail = { ...availability, time: slot };
    setAvailability(newAvail);
    setVolunteer({ ...volunteer, availability: newAvail }); // sync with parent
  };

  return (
    <div className="dashboard-box availability-box">
      <h2>Update Your Availability</h2>

      <div className="availability-grid" style={{ gridTemplateColumns: "1fr" }}>
        {daysOfWeek.map((day) => (
          <div key={day} className="checkbox-item">
            <input
              type="checkbox"
              checked={availability.days.includes(day)}
              onChange={(e) => toggleDay(day, e.target.checked)}
            />
            <label style={{ color: "black" }}>{day}</label>
          </div>
        ))}
      </div>

      <div className="availability-grid" style={{ gridTemplateColumns: "1fr" }}>
        {timeSlots.map((slot) => (
          <div key={slot} className="checkbox-item">
            <input
              type="radio"
              name="time-slot"
              checked={availability.time === slot}
              onChange={() => selectTime(slot)}
            />
            <label style={{ color: "black" }}>{slot}</label>
          </div>
        ))}
      </div>

      <button className="btn-primary" onClick={updateAvailability}>
        Save Availability
      </button>
    </div>
  );
};

export default VolunteerAvailability;
