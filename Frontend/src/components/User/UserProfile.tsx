import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import { 
  FaUser, 
  FaEnvelope, 
  FaUserTag, 
  FaInfoCircle, 
  FaCalendarAlt, 
  FaClock, 
  FaUserCircle, 
  FaEdit 
} from "react-icons/fa";
import "./UserProfile.css";

Modal.setAppElement("#root"); // Required for accessibility

export interface UserProfileProps {
  userId: string;
}

export interface UserProfileData {
  user_id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState({ username: "", email: "" });

  const API_URL = "http://localhost:5000/";

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}user/profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProfile(res.data);
        setEditData({ username: res.data.username, email: res.data.email });
      } catch (err) {
        console.error(err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API_URL}user/profile/${userId}`,
        editData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProfile(res.data); // Update local profile
      setIsModalOpen(false); // Close modal
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!profile) return <p>No profile found.</p>;

  return (
    <div className="dashboard-box profile-info">
      <div className="profile-header">
        <h2>
          <FaUserCircle className="profile-icon-header" /> Your Profile
        </h2>
        <button className="edit-btn" onClick={() => setIsModalOpen(true)}>
          <FaEdit /> Edit
        </button>
      </div>

      <p><strong><FaUser className="profile-icon" /> Name:</strong> {profile.username}</p>
      <p><strong><FaEnvelope className="profile-icon" /> Email:</strong> {profile.email}</p>
      <p><strong><FaUserTag className="profile-icon" /> Role:</strong> {profile.role}</p>
      <p><strong><FaInfoCircle className="profile-icon" /> Account Status:</strong> {profile.status}</p>
      {profile.created_at && (
        <p><strong><FaCalendarAlt className="profile-icon" /> Joined:</strong> {new Date(profile.created_at).toLocaleDateString()}</p>
      )}
      {profile.updated_at && (
        <p><strong><FaClock className="profile-icon" /> Last Updated:</strong> {new Date(profile.updated_at).toLocaleDateString()}</p>
      )}

      {/* Modal for editing profile */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Edit Profile"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <h2>Edit Profile</h2>
        <div className="modal-content">
          <label>
            Name:
            <input
              type="text"
              name="username"
              value={editData.username}
              onChange={handleEditChange}
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={editData.email}
              onChange={handleEditChange}
            />
          </label>
          <div className="modal-actions">
            <button className="edit-btn" onClick={handleSave}>Save</button>
            <button className="edit-btn" style={{ backgroundColor: "#aaa" }} onClick={() => setIsModalOpen(false)}>Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserProfile;
