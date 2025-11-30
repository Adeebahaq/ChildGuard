// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoginPage from '../components/auth/LoginPage';
import RegisterPage from '../components/auth/RegisterPage';
import ReportCase from "../components/case/ReportCase";
import './HomePage.css';
import HeroImage from '../assets/child-future-contrast.jpg';

// Accept user and onLogin props from App.js
function HomePage({ user, onLogin }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [awarenessContent, setAwarenessContent] = useState([]);
  const [loading, setLoading] = useState(true);

  const roles = [
    { title: "End Child Labor", icon: "🤝", description: "Protect children from exploitation and hazardous agricultural work." },
    { title: "Educational Support", icon: "📚", description: "Provide full sponsorship covering fees, books, and uniforms." },
    { title: "Community Advocacy", icon: "📣", description: "Raise awareness about child rights and facilitate anonymous reporting." },
    { title: "Transparent Tracking", icon: "✔️", description: "Offer sponsors and parents real-time updates on child progress." },
  ];

  // Listen for NavBar events
  useEffect(() => {
    const handleAuthEvent = (e) => openPanel(e.detail);
    window.addEventListener('openAuthPanel', handleAuthEvent);
    return () => window.removeEventListener('openAuthPanel', handleAuthEvent);
  }, []);

  // Fetch awareness content
  useEffect(() => {
    const fetchAwareness = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/awareness");
        setAwarenessContent(res.data.data || []);
      } catch (err) {
        console.error("Failed to load awareness content", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAwareness();
  }, []);

  const openPanel = (tab) => {
    setActiveTab(tab);
    setIsPanelOpen(true);
  };

  const closeModal = () => setIsPanelOpen(false);

  const getEmbedUrl = (url) => url ? url.replace("watch?v=", "embed/").replace("&", "?") : "";

  const openFullArticle = (item) => {
    const win = window.open('', '_blank', 'width=900,height=700,scrollbars=yes,resizable=yes');
    win.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${item.title} - ChildGuard</title>
        <style>
          body { margin:0; font-family: 'Segoe UI', sans-serif; background:#f8fcfc; padding:40px; line-height:1.8; color:#333; }
          .container { max-width:800px; margin:0 auto; background:white; padding:40px; border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,0.1); }
          h1 { color:#006666; font-size:2.3rem; border-bottom:4px solid #FFD700; padding-bottom:12px; margin-bottom:20px; }
          .date { color:#888; font-style:italic; margin-bottom:30px; font-size:1rem; }
          .content { font-size:1.1rem; }
          .close { text-align:center; margin-top:50px; }
          .close a { color:#006666; font-weight:600; text-decoration:none; font-size:1.1rem; }
          .close a:hover { color:#FFD700; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${item.title.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</h1>
          <p class="date">Published on: ${item.published_at ? new Date(item.published_at).toLocaleDateString('en-GB') : 'Recently'}</p>
          <div class="content">${item.content}</div>
          <div class="close"><a href="javascript:window.close()">Close window</a></div>
        </div>
      </body>
      </html>
    `);
    win.document.close();
  };

  const goToDashboard = () => {
    if (!user) return openPanel('login');

    // Role-based navigation
    switch (user.role) {
      case 'volunteer':
        navigate(`/volunteer/${user.id}/dashboard`);
        break;
      case 'admin':
        navigate('/admin');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div className="home-page-container">
      
      {/* Modal Logic */}
      {isPanelOpen && (
        <div className="auth-modal-overlay" onClick={closeModal}>
          <div className="auth-modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={closeModal}>×</button>
            <div className="form-body">
              <div className="modal-content-area">
                {activeTab === 'login' && <LoginPage onLogin={onLogin} closeModal={closeModal} />}
                {activeTab === 'register' && <RegisterPage />}
                {activeTab === 'about' && !user && (
                  <div className="about-us-content">
                    <h2>ChildGuard: Our Mission</h2>
                    <p>ChildGuard is a web-based platform dedicated to protecting children from labor exploitation...</p>
                    <button className="cta-btn" onClick={() => openPanel('register')}>Join us</button>
                  </div>
                )}
                {activeTab === 'report' && <ReportCase userId={user ? user.id : null} />}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Protecting Children, Building Futures</h1>
          <p className="hero-subtitle">
            A centralized platform to end child labor through <b>Educational Sponsorship</b> and <b>Anonymous Reporting</b>.
          </p>
          <div className="hero-buttons">
            {user ? (
              <button className="cta-btn" onClick={goToDashboard}>Go to Dashboard</button>
            ) : (
              <button className="cta-btn" onClick={() => openPanel('register')}>Sponsor a Child Today</button>
            )}
            <button className="cta-btn-outline" onClick={() => openPanel('report')}>Report a Case</button>
          </div>
        </div>
        <div className="hero-image">
          <img src={HeroImage} alt="Contrast between child in school uniform and child labor" />
        </div>
      </section>

      {/* Core Objectives */}
      <section className="impact-section">
        <h2>Our Core Objectives</h2>
        <div className="objectives-container">
          {roles.map((role) => (
            <div key={role.title} className="objective-card">
              <span className="objective-icon">{role.icon}</span>
              <h3>{role.title}</h3>
              <p>{role.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Awareness & Updates */}
      <section className="awareness-section">
        <h2>Public Awareness Content</h2>
        {loading ? (
          <p>Loading latest updates...</p>
        ) : awarenessContent.length === 0 ? (
          <p>No published content yet. Check back soon!</p>
        ) : (
          <div className="awareness-grid">
            {awarenessContent.map((item) => (
              <div
                key={item.content_id}
                className="awareness-card awareness-card-clickable"
                onClick={() => {
                  if (item.type === 'article' || item.type === 'guide') openFullArticle(item);
                  else if (item.type === 'video' && item.content.includes('youtube.com')) window.open(item.content, '_blank');
                }}
                title={item.type === 'video' ? "Click to watch on YouTube" : "Click to read full article"}
              >
                {item.type === 'video' && item.content.includes('youtube.com') && (
                  <div className="awareness-video-wrapper">
                    <iframe src={getEmbedUrl(item.content)} title={item.title} allowFullScreen className="awareness-video" />
                  </div>
                )}
                <div className="awareness-text">
                  <h3>{item.title}</h3>
                  <p dangerouslySetInnerHTML={{
                    __html: item.content.length > 280 ? item.content.substring(0, 280) + "..." : item.content
                  }} />
                  <div className="awareness-footer">
                    <small>Published on: {item.published_at ? new Date(item.published_at).toLocaleDateString() : "Recently"}</small>
                    {(item.type === 'article' || item.type === 'guide') && item.content.length > 280 && <span className="read-more">Read full article →</span>}
                    {item.type === 'video' && <span className="read-more">Watch Video →</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="footer">
        &copy; 2025 ChildGuard. All Rights Reserved.
      </footer>

      {/* ——————— EMERGENCY WHATSAPP FLOATING BUTTON ——————— */}
      <a
        href="https://wa.me/923216604318?text=EMERGENCY%20CHILD%20IN%20DANGER%21%0A%0AI%20am%20reporting%20a%20child%20in%20immediate%20danger%21%0APlease%20reply%20NOW%21"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          width: "70px",
          height: "70px",
          backgroundColor: "#d32f2f",
          color: "white",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "40px",
          fontWeight: "bold",
          boxShadow: "0 8px 30px rgba(211, 47, 47, 0.6)",
          zIndex: 9999,
          textDecoration: "none",
          animation: "pulse 2s infinite",
          cursor: "pointer"
        }}
        title="EMERGENCY — Contact Admin on WhatsApp IMMEDIATELY"
      >
        !
      </a>

      {/* Pulsing animation for urgency */}
      <style jsx>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(211, 47, 47, 0.8);
          }
          70% {
            box-shadow: 0 0 0 20px rgba(211, 47, 47, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(211, 47, 47, 0);
          }
        }
      `}</style>
    </div>
  );
}

export default HomePage;