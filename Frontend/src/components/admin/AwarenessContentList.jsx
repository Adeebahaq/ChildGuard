// src/components/admin/AwarenessContentList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const AwarenessContentList = ({ onEdit, onContentDeleted }) => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = "http://localhost:5000";
  const token = localStorage.getItem("authToken");

  const fetchContents = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/awareness-contents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContents(res.data.data || []);
    } catch (err) {
      alert("Failed to load content: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this content?")) return;

    try {
      await axios.delete(`${API_URL}/api/admin/awareness-contents/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onContentDeleted();
      setContents(contents.filter((c => c.content_id !== id)));
    } catch (err) {
      alert("Delete failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (content) => {
    localStorage.setItem("editingAwarenessContent", JSON.stringify(content));
    onEdit();
  };

  if (loading) return <p>Loading content...</p>;

  return (
    <div>
      <h2>All Awareness Content</h2>
      {contents.length === 0 ? (
        <p>No content yet. Create your first article/video/guide!</p>
      ) : (
        <div style={{ display: "grid", gap: "20px" }}>
          {contents.map((item) => (
            <div
              key={item.content_id}
              style={{
                border: "2px solid #008080",
                borderRadius: "10px",
                padding: "20px",
                backgroundColor: item.status === "published" ? "#e6f7f7" : "#fff3e0",
              }}
            >
              <h3>{item.title}</h3>
              <p>
                <strong>Type:</strong> {item.type} |{" "}
                <strong>Status:</strong>{" "}
                <span style={{ color: item.status === "published" ? "green" : "orange" }}>
                  {item.status || "draft"}
                </span>
              </p>
              <p>
                <strong>Created:</strong>{" "}
                {new Date(item.created_at).toLocaleDateString()}
              </p>

              <div style={{ marginTop: "15px" }}>
                <button
                  onClick={() => handleEdit(item)}
                  style={{
                    backgroundColor: "#ffc107",
                    color: "#008080",
                    marginRight: "10px",
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.content_id)}
                  style={{
                    backgroundColor: "#dc3545",
                    color: "white",
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AwarenessContentList;