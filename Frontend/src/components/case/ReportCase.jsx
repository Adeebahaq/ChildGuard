import React, { useState } from "react";
import axios from "axios";
import "./ReportCase.css";

function ReportCase({ onClose }) {
  const [formData, setFormData] = useState({
    child_name: "",
    child_gender: "",
    child_age: "",
    location: "",
    description: "",
    is_anonymous: false,
  });

  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      // Removed photoPreview code
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const sendData = new FormData();
      Object.entries(formData).forEach(([key, value]) =>
        sendData.append(key, key === "is_anonymous" ? (value ? 1 : 0) : value)
      );

      if (photo) sendData.append("photo", photo);

      await axios.post("http://localhost:5000/case/report", sendData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("Report submitted successfully!");
      setFormData({
        child_name: "",
        child_gender: "",
        child_age: "",
        location: "",
        description: "",
        is_anonymous: false,
      });
      setPhoto(null);
    } catch (error) {
      console.error(error);
      setMessage("Error submitting report.");
    }

    setLoading(false);
  };

  return (
    <div >
      {onClose && (
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      )}

      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Report a Case</h2>
      {message && <p className="message">{message}</p>}

      <form onSubmit={handleSubmit}>
        <label>Child Name</label>
        <input
          name="child_name"
          value={formData.child_name}
          onChange={handleChange}
          required
        />

        <label>Gender</label>
        <select
          name="child_gender"
          value={formData.child_gender}
          onChange={handleChange}
          required
        >
          <option value="">Select</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        <label>Age</label>
        <input
          name="child_age"
          type="number"
          value={formData.child_age}
          onChange={handleChange}
          required
        />

        <label>Location</label>
        <input
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
        />

        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />

        <label>
          <input
            type="checkbox"
            name="is_anonymous"
            checked={formData.is_anonymous}
            onChange={handleChange}
          />
          Report Anonymously
        </label>

        <label className="upload-label">
          Upload Photo
          <input type="file" accept="image/*" onChange={handleFile} />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Report"}
        </button>
      </form>
    </div>
  );
}

export default ReportCase;
