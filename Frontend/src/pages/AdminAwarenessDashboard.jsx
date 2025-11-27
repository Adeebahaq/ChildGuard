// src/pages/AdminAwarenessDashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import "./AdminAwarenessDashboard.css";

const API_URL = "http://localhost:5000/api/admin/awareness-contents";

const AdminAwarenessDashboard = () => {
  const [contents, setContents] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("article");
  const [status, setStatus] = useState("published");
  const [editingId, setEditingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("authToken");

  const getAdminId = () => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.user_id || payload.id || payload.admin_id;
    } catch (e) { return null; }
  };

  const fetchContents = async () => {
    try {
      const res = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
      setContents(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load content");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!title.trim() || !content.trim()) {
      toast.error("Title and content required");
      return;
    }

    const admin_id = getAdminId();
    if (!admin_id) {
      toast.error("Login expired");
      return;
    }

    setLoading(true);
    try {
      const payload = { admin_id: String(admin_id), title: title.trim(), content: content.trim(), type, status };

      if (editingId) {
        await axios.patch(`${API_URL}/${editingId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Updated successfully!");
        setShowEditModal(false);
        setEditingId(null);
      } else {
        await axios.post(API_URL, payload, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Published successfully!");
      }

      setTitle(""); setContent(""); setType("article"); setStatus("published");
      fetchContents();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item) => {
    setTitle(item.title);
    setContent(item.content);
    setType(item.type);
    setStatus(item.status);
    setEditingId(item.content_id);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingId(null);
    setTitle(""); setContent(""); setType("article"); setStatus("published");
  };

  const confirmDelete = (item) => {
    setDeletingItem(item);
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    if (!deletingItem) return;
    try {
      await axios.delete(`${API_URL}/${deletingItem.content_id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Deleted successfully");
      setShowDeleteModal(false);
      setDeletingItem(null);
      fetchContents();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingItem(null);
  };

  useEffect(() => { if (token) fetchContents(); }, [token]);

  return (
    <div className="awareness-dashboard">
      <Toaster position="top-right" />
      
      <div className="awareness-header">
        <h1>Awareness Content Management</h1>
      </div>

      {/* CREATE NEW CONTENT */}
      <div className="create-section">
        <h2>CREATE NEW CONTENT</h2>
        <form onSubmit={handleSubmit}>
          <input className="form-input" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <div className="form-grid">
            <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="article">Article</option>
              <option value="video">Video</option>
              <option value="guide">Guide</option>
            </select>
            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <textarea className="form-textarea" placeholder="Content..." value={content} onChange={(e) => setContent(e.target.value)} required />
          <button type="submit" disabled={loading} className="btn-publish">
            {loading ? "Publishing..." : "PUBLISH CONTENT"}
          </button>
        </form>
      </div>

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>EDIT CONTENT</h2>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
              <input className="form-input" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              <div className="form-grid">
                <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="article">Article</option>
                  <option value="video">Video</option>
                  <option value="guide">Guide</option>
                </select>
                <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <textarea className="form-textarea" placeholder="Content..." value={content} onChange={(e) => setContent(e.target.value)} required />
              <div className="modal-actions">
                <button type="submit" disabled={loading} className="btn-update">
                  {loading ? "Updating..." : "UPDATE CONTENT"}
                </button>
                <button type="button" onClick={closeEditModal} className="btn-cancel">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && deletingItem && (
        <div className="modal-overlay">
          <div className="modal-content delete-modal">
            <h3>Delete Content?</h3>
            <p>Are you sure you want to <strong>permanently delete</strong> this content?</p>
            <p><strong style={{ color: "#008080" }}>{deletingItem.title}</strong></p>
            <div className="modal-actions">
              <button onClick={executeDelete} className="btn-update">Yes, Delete</button>
              <button onClick={cancelDelete} className="btn-cancel">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT LIST */}
      <h2 style={{ color: "#008080", textAlign: "center", margin: "50px 0 30px" }}>All Content ({contents.length})</h2>
      {contents.length === 0 ? (
        <p style={{ textAlign: "center", color: "#777", fontSize: "18px" }}>No content published yet.</p>
      ) : (
        contents.map((item) => (
          <div key={item.content_id} className="content-card">
            <h3>
              {item.title}
              {item.status === "draft" && <span className="draft-badge">DRAFT</span>}
            </h3>
            <p style={{ color: "#555", lineHeight: "1.6" }}>{item.content.substring(0, 300)}...</p>
            <div className="btn-group">
              <button onClick={() => startEdit(item)} className="btn-edit">Edit</button>
              <button onClick={() => confirmDelete(item)} className="btn-delete">Delete</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminAwarenessDashboard;