import React, { useState } from "react";
import axios from "axios";

const ReportCase = ({ userId = null }) => {
  const [formData, setFormData] = useState({
    location: "",
    description: "",
    child_name: "",
    child_age: "",
    phone: "",
    photo_url: "",
    is_anonymous: false,
  });

  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        user_id: userId,
        child_age: formData.child_age ? parseInt(formData.child_age, 10) : null,
        is_anonymous: formData.is_anonymous ? 1 : 0,
      };

      const res = await axios.post("http://localhost:5000/case/report", payload);
      if (res.data.success) {
        setStatus("Report submitted successfully!");

        setFormData({
          location: "",
          description: "",
          child_name: "",
          child_age: "",
          phone: "",
          photo_url: "",
          is_anonymous: false,
        });
      }
    } catch (err) {
      console.error(err);
      setStatus("Error submitting report.");
    }
  };

  return (
    <div className="report-case-form">
      <h2>Report a Case</h2>
      {status && <p className="status-message">{status}</p>}

      {/* Scrollable content inside modal */}
      <div className="modal-scrollable-content">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Your Phone (optional):</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input type="checkbox" name="is_anonymous" checked={formData.is_anonymous} onChange={handleChange} />
              Anonymous
            </label>
          </div>

          <div className="form-group">
            <label>Location:</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Description:</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Child Name:</label>
            <input type="text" name="child_name" value={formData.child_name} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Child Age:</label>
            <input type="number" name="child_age" value={formData.child_age} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Photo URL:</label>
            <input type="text" name="photo_url" value={formData.photo_url} onChange={handleChange} />
          </div>

          <button type="submit" className="cta-btn">Submit Report</button>
        </form>
      </div>
    </div>
  );
};

export default ReportCase;