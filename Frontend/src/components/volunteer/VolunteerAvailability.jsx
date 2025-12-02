// src/components/volunteer/VolunteerAvailability.jsx
import React, { useState, useEffect } from "react";
import "./VolunteerAvailability.css";

// Now accepts volunteerId to fetch data if 'volunteer' prop is missing
const VolunteerAvailability = ({ volunteer, setVolunteer, volunteerId }) => {
  const API_URL = "http://localhost:5000/";

  // 1. Local state to store fetched volunteer if prop isn't provided
  const [fetchedVolunteer, setFetchedVolunteer] = useState(null);
  
  // Use the prop if available, otherwise use fetched data
  const activeVolunteer = volunteer || fetchedVolunteer;

  // Initialize availability state
  const [availability, setAvailability] = useState({ days: [], time: "" });

  // 2. EFFECT: Fetch volunteer data if we are in "Standalone Mode" (no volunteer prop)
  useEffect(() => {
    if (!volunteer && volunteerId) {
      const fetchVolunteerData = async () => {
        try {
          // Check 'token' or 'authToken' depending on what your login saves
          const token = localStorage.getItem("authToken") || localStorage.getItem("token");
          
          const res = await fetch(`${API_URL}volunteer/${volunteerId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          
          if (data.volunteer) {
            setFetchedVolunteer(data.volunteer);
          }
        } catch (err) {
          console.error("Failed to load volunteer for availability:", err);
        }
      };
      fetchVolunteerData();
    }
  }, [volunteer, volunteerId]);

  // 3. EFFECT: Parse availability when the active volunteer data changes
  useEffect(() => {
    if (!activeVolunteer) return;

    let avail = { days: [], time: "" };
    try {
      if (activeVolunteer.availability) {
        avail =
          typeof activeVolunteer.availability === "string"
            ? JSON.parse(activeVolunteer.availability)
            : activeVolunteer.availability;
      }
    } catch (err) {
      console.warn("Failed to parse volunteer availability:", err);
    }
    setAvailability(avail);
  }, [activeVolunteer]);

  // Update backend
  const updateAvailability = async () => {
    if (!activeVolunteer) {
      alert("Volunteer data not loaded yet!");
      return;
    }

    try {
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      if (!token) throw new Error("No auth token found");

      const res = await fetch(
        `${API_URL}volunteer/${activeVolunteer.volunteer_id}/availability`,
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
      
      // Update local state if standalone
      if (!volunteer) {
        setFetchedVolunteer(data.volunteer);
      } 
      // Update parent state if function exists
      else if (setVolunteer) {
        setVolunteer(data.volunteer); 
      }
      
      alert("Availability saved!");
    } catch (err) {
      console.error("Error saving availability:", err);
      alert(err instanceof Error ? err.message : "Failed to save availability");
    }
  };

  const daysOfWeek = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
  ];

  const timeSlots = [
    "Morning (9AM - 12PM)", "Afternoon (12PM - 3PM)", "Evening (3PM - 6PM)",
  ];

  // Toggle a day in availability
  const toggleDay = (day, checked) => {
    const newDays = checked
      ? [...availability.days, day]
      : availability.days.filter((d) => d !== day);
    const newAvail = { ...availability, days: newDays };
    
    setAvailability(newAvail);
    
    // FIX: Only call setVolunteer if it is actually a function (Parent Mode)
    if (typeof setVolunteer === 'function' && volunteer) {
       setVolunteer({ ...volunteer, availability: newAvail }); 
    }
  };

  // Select time slot
  const selectTime = (slot) => {
    const newAvail = { ...availability, time: slot };
    
    setAvailability(newAvail);
    
    // FIX: Only call setVolunteer if it is actually a function (Parent Mode)
    if (typeof setVolunteer === 'function' && volunteer) {
      setVolunteer({ ...volunteer, availability: newAvail }); 
    }
  };

  if (!activeVolunteer) {
    return <div className="dashboard-box"><p>Loading availability...</p></div>;
  }

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