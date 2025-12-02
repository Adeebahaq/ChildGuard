import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ParentFeeChallan.css";

const API_URL_CHILDREN = "http://localhost:5000/api/parent/myChildren";
const API_URL_UPLOAD = "http://localhost:5000/api/parent/fee-challan";

const ParentFeeChallan = () => {
  const [children, setChildren] = useState([]);
  const [selectedFile, setSelectedFile] = useState({});
  const [amount, setAmount] = useState({});
  const [issuedAt, setIssuedAt] = useState({});
  const [dueDate, setDueDate] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState({});
  const [showHistory, setShowHistory] = useState({});
  const [challanHistory, setChallanHistory] = useState({});
  const [loadingHistory, setLoadingHistory] = useState({});

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(API_URL_CHILDREN, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const childrenData = res.data.children.map((child) => ({
        ...child,
        status: child.status || "not_sponsored",
      }));
      setChildren(childrenData);
    } catch (err) {
      console.error("Error loading children:", err);
      alert("Failed to load children data");
    }
  };

  const validateForm = (childId) => {
    const newErrors = {};

    if (!selectedFile[childId]) {
      newErrors.file = "Please upload a challan file";
    } else {
      const file = selectedFile[childId];
      const validTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        newErrors.file = "Only PDF, JPG, JPEG, and PNG files are allowed";
      }
      if (file.size > maxSize) {
        newErrors.file = "File size must be less than 5MB";
      }
    }

    if (!amount[childId]) {
      newErrors.amount = "Fee amount is required";
    } else if (parseFloat(amount[childId]) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    } else if (parseFloat(amount[childId]) > 1000000) {
      newErrors.amount = "Amount seems unusually high";
    }

    if (!issuedAt[childId]) {
      newErrors.issuedAt = "Issued date is required";
    } else {
      const issued = new Date(issuedAt[childId]);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (issued > today) {
        newErrors.issuedAt = "Issued date cannot be in the future";
      }
    }

    if (!dueDate[childId]) {
      newErrors.dueDate = "Due date is required";
    } else if (issuedAt[childId]) {
      const issued = new Date(issuedAt[childId]);
      const due = new Date(dueDate[childId]);
      
      if (due < issued) {
        newErrors.dueDate = "Due date must be after issued date";
      }
    }

    setErrors((prev) => ({ ...prev, [childId]: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (childId, file) => {
    setSelectedFile((prev) => ({ ...prev, [childId]: file }));
    if (errors[childId]?.file) {
      setErrors((prev) => ({
        ...prev,
        [childId]: { ...prev[childId], file: undefined }
      }));
    }
  };

  const handleAmountChange = (childId, value) => {
    setAmount((prev) => ({ ...prev, [childId]: value }));
    if (errors[childId]?.amount) {
      setErrors((prev) => ({
        ...prev,
        [childId]: { ...prev[childId], amount: undefined }
      }));
    }
  };

  const handleIssuedAtChange = (childId, value) => {
    setIssuedAt((prev) => ({ ...prev, [childId]: value }));
    if (errors[childId]?.issuedAt) {
      setErrors((prev) => ({
        ...prev,
        [childId]: { ...prev[childId], issuedAt: undefined }
      }));
    }
  };

  const handleDueDateChange = (childId, value) => {
    setDueDate((prev) => ({ ...prev, [childId]: value }));
    if (errors[childId]?.dueDate) {
      setErrors((prev) => ({
        ...prev,
        [childId]: { ...prev[childId], dueDate: undefined }
      }));
    }
  };

  const handleUpload = async (childId) => {
    if (!validateForm(childId)) {
      return;
    }

    setLoading((prev) => ({ ...prev, [childId]: true }));

    const formData = new FormData();
    formData.append("child_id", childId);
    formData.append("amount", amount[childId]);
    formData.append("issued_at", issuedAt[childId]);
    formData.append("due_date", dueDate[childId]);
    formData.append("challan_file", selectedFile[childId]);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_URL_UPLOAD}/${childId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      
      alert(res.data.message || "Fee challan uploaded successfully!");
      
      // Clear form after successful upload
      setSelectedFile((prev) => ({ ...prev, [childId]: undefined }));
      setAmount((prev) => ({ ...prev, [childId]: "" }));
      setIssuedAt((prev) => ({ ...prev, [childId]: "" }));
      setDueDate((prev) => ({ ...prev, [childId]: "" }));
      setErrors((prev) => ({ ...prev, [childId]: {} }));

      // Refresh history if it's currently shown
      if (showHistory[childId]) {
        loadChallanHistory(childId);
      }
      
    } catch (err) {
      console.error("Upload failed:", err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error ||
                          `Upload failed (${err.response?.status || 'Network Error'})`;
      alert(errorMessage);
    } finally {
      setLoading((prev) => ({ ...prev, [childId]: false }));
    }
  };

  const loadChallanHistory = async (childId) => {
    setLoadingHistory((prev) => ({ ...prev, [childId]: true }));
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL_UPLOAD}/${childId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setChallanHistory((prev) => ({ 
        ...prev, 
        [childId]: res.data.data 
      }));
    } catch (err) {
      console.error("Failed to load history:", err);
      alert("Failed to load challan history");
    } finally {
      setLoadingHistory((prev) => ({ ...prev, [childId]: false }));
    }
  };

  const toggleHistory = async (childId) => {
    const isCurrentlyShown = showHistory[childId];
    
    setShowHistory((prev) => ({ 
      ...prev, 
      [childId]: !isCurrentlyShown 
    }));

    // Load history if we're showing it and haven't loaded yet
    if (!isCurrentlyShown && !challanHistory[childId]) {
      await loadChallanHistory(childId);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="challans-dashboard-box">
      <h2>Upload Fee Challan</h2>

      {children.length === 0 ? (
        <p style={{ textAlign: "center", color: "#666" }}>No children found.</p>
      ) : (
        children.map((child) => (
          <div key={child.child_id} className="challan-card">
            <h3 style={{ color: "#008080", marginBottom: "10px" }}>{child.name}</h3>
            <p style={{ margin: "5px 0" }}>Age: {child.age}</p>
            <p style={{ margin: "5px 0", textTransform: "capitalize" }}>
              Status: {child.status.replace("_", " ")}
            </p>

            {child.status !== "sponsored" ? (
              <p style={{ color: "#999", marginTop: "15px", fontStyle: "italic" }}>
                This child is not sponsored yet.
              </p>
            ) : (
              <>
                <div className="form-group">
                  <label>Fee Amount (PKR)</label>
                  <input
                    type="number"
                    placeholder="Enter fee amount"
                    value={amount[child.child_id] || ""}
                    onChange={(e) => handleAmountChange(child.child_id, e.target.value)}
                    min="0"
                    step="0.01"
                  />
                  {errors[child.child_id]?.amount && (
                    <span className="error">{errors[child.child_id].amount}</span>
                  )}

                  <label>Issued Date</label>
                  <input
                    type="date"
                    value={issuedAt[child.child_id] || ""}
                    onChange={(e) => handleIssuedAtChange(child.child_id, e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {errors[child.child_id]?.issuedAt && (
                    <span className="error">{errors[child.child_id].issuedAt}</span>
                  )}

                  <label>Due Date</label>
                  <input
                    type="date"
                    value={dueDate[child.child_id] || ""}
                    onChange={(e) => handleDueDateChange(child.child_id, e.target.value)}
                    min={issuedAt[child.child_id] || ""}
                  />
                  {errors[child.child_id]?.dueDate && (
                    <span className="error">{errors[child.child_id].dueDate}</span>
                  )}

                  <label>Challan File (PDF, JPG, PNG - Max 5MB)</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(child.child_id, e.target.files[0])}
                  />
                  {errors[child.child_id]?.file && (
                    <span className="error">{errors[child.child_id].file}</span>
                  )}

                  <button
                    onClick={() => handleUpload(child.child_id)}
                    disabled={loading[child.child_id]}
                    className={loading[child.child_id] ? "disabled-button" : ""}
                  >
                    {loading[child.child_id] ? "Uploading..." : "Upload Fee Challan"}
                  </button>

                  {/* History Button */}
                  <button
                    onClick={() => toggleHistory(child.child_id)}
                    style={{ 
                      backgroundColor: "#17a2b8",
                      marginTop: "10px"
                    }}
                  >
                    {showHistory[child.child_id] ? "Hide History" : "View Payment History"}
                  </button>
                </div>

                {/* Challan History Section */}
                {showHistory[child.child_id] && (
                  <div style={{ 
                    marginTop: "20px", 
                    padding: "15px", 
                    backgroundColor: "#f0f8ff",
                    borderRadius: "8px",
                    border: "1px solid #b0d4e3"
                  }}>
                    <h4 style={{ color: "#008080", marginBottom: "15px" }}>
                      Payment History
                    </h4>

                    {loadingHistory[child.child_id] ? (
                      <p style={{ textAlign: "center", color: "#666" }}>
                        Loading history...
                      </p>
                    ) : challanHistory[child.child_id]?.challans?.length === 0 ? (
                      <p style={{ textAlign: "center", color: "#666" }}>
                        No payment history yet.
                      </p>
                    ) : (
                      <>
                        <div style={{ 
                          marginBottom: "15px", 
                          padding: "10px",
                          backgroundColor: "#e6f7ff",
                          borderRadius: "6px"
                        }}>
                          <strong>Total Paid: </strong>
                          {formatCurrency(challanHistory[child.child_id]?.total_paid || 0)}
                          <span style={{ marginLeft: "20px" }}>
                            <strong>Total Challans: </strong>
                            {challanHistory[child.child_id]?.total_challans || 0}
                          </span>
                        </div>

                        {challanHistory[child.child_id]?.challans?.map((challan, index) => (
                          <div 
                            key={challan.challan_id}
                            style={{
                              padding: "12px",
                              marginBottom: "10px",
                              backgroundColor: "white",
                              borderRadius: "6px",
                              border: "1px solid #d0d0d0"
                            }}
                          >
                            <div style={{ 
                              display: "flex", 
                              justifyContent: "space-between",
                              alignItems: "center"
                            }}>
                              <div>
                                <strong style={{ color: "#008080" }}>
                                  {formatCurrency(challan.amount)}
                                </strong>
                                <p style={{ margin: "5px 0", fontSize: "0.9em", color: "#666" }}>
                                  Issued: {formatDate(challan.issued_at)} | 
                                  Due: {formatDate(challan.due_date)}
                                </p>
                                <p style={{ margin: "5px 0", fontSize: "0.85em", color: "#999" }}>
                                  Uploaded: {formatDate(challan.created_at)}
                                </p>
                              </div>
                              <div>
                                <span style={{
                                  backgroundColor: "#28a745",
                                  color: "white",
                                  padding: "4px 12px",
                                  borderRadius: "12px",
                                  fontSize: "0.85em",
                                  fontWeight: "600"
                                }}>
                                  PAID
                                </span>
                                {challan.challan_url && (
                                  <a 
                                    href={`http://localhost:5000${challan.challan_url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      marginLeft: "10px",
                                      color: "#008080",
                                      textDecoration: "none",
                                      fontSize: "0.9em"
                                    }}
                                  >
                                    View File
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ParentFeeChallan;