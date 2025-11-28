// src/components/admin/AwarenessContentForm.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const AwarenessContentForm = ({ onSuccess }) => {
  const [form, setForm] = useState({
    title: "",
    content: "",
    type: "article",
    status: "draft",
  });
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const API_URL = "http://localhost:5000";
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const stored = localStorage.getItem("editingAwarenessContent");
    if (stored) {
      const content = JSON.parse(stored);
      setForm({
        title: content.title,
        content: content.content,
        type: content.type,
        status: content.status || "draft",
      });
      setEdit(true);
      setEditId(content.content_id);
      localStorage.removeItem("editingAwarenessContent");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await axios.patch(
          `${API_URL}/api/admin/awareness-contents/${editId}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(`${API_URL}/api/admin/awareness-contents`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      onSuccess();
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h2>{isEdit ? "Edit" : "Create New"} Awareness Content</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label><strong>Title</strong></label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #008080" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label><strong>Type</strong></label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            style={{ width: "100%", padding: "10px", borderRadius: "5px" }}
          >
            <option value="article">Article</option>
            <option value="video">Video (YouTube/Vimeo link)</option>
            <option value="guide">Guide / PDF</option>
          </select>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label><strong>Content</strong> (article = full text, video = embed URL)</label>
          <textarea
            required
            rows={12}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #008080" }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label><strong>Status</strong></label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            style={{ width: "100%", padding: "10px", borderRadius: "5px" }}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: "#008080",
            color: "white",
            padding: "12px 30px",
            fontSize: "1.1em",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          {loading ? "Saving..." : isEdit ? "Update Content" : "Create Content"}
        </button>
      </form>
    </div>
  );
};

export default AwarenessContentForm;