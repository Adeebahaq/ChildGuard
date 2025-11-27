import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/auth/families/enroll";

const RegisterFamily = ({ family, onFamilyUpdated }) => {
  const [income, setIncome] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Optional: prefill if user already has family
  useEffect(() => {
    if (family) {
      setIncome(family.income || "");
      setAddress(family.address || "");
    }
  }, [family]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setMessage("User not logged in.");
        setLoading(false);
        return;
      }

      const res = await axios.post(
        API_URL,
        {
          income,
          address,
          // proof_documents can be added here if needed
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        setMessage("Family registration submitted successfully.");
        setIncome("");
        setAddress("");
        onFamilyUpdated(); // Refresh parent profile
      } else {
        setMessage(res.data.message || "Failed to register family.");
      }
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message || "Failed to register family. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-box">
      <h2>Register Your Family</h2>

      {!family && (
        <form onSubmit={handleSubmit}>
          <input
            type="number"
            placeholder="Monthly Income"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Home Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Family Application"}
          </button>
        </form>
      )}

      {message && <p className="msg">{message}</p>}
    </div>
  );
};

export default RegisterFamily;
