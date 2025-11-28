// src/components/User/UserProfile.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./UserProfile.css";
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

  const API_URL = "http://localhost:5000/";

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("authToken");

        
        const res = await axios.get(`${API_URL}user/profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        
        setProfile(res.data); 
      } catch (err) {
        console.error(err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!profile) return <p>No profile found.</p>;

  return (
    <div className="dashboard-box profile-info">
      <h2>Your Profile</h2>
      <p><strong>Name:</strong> {profile.username}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>User ID:</strong> {profile.user_id}</p>
      <p><strong>Role:</strong> {profile.role}</p>
      <p><strong>Account Status:</strong> {profile.status}</p>
      {profile.created_at && <p><strong>Created At:</strong> {new Date(profile.created_at).toLocaleString()}</p>}
      {profile.updated_at && <p><strong>Last Updated:</strong> {new Date(profile.updated_at).toLocaleString()}</p>}
    </div>
  );
};

export default UserProfile;
