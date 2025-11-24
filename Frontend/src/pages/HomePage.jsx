import React, { useState } from 'react';
import LoginPage from '../components/auth/LoginPage';
import RegisterPage from '../components/auth/RegisterPage';
import ReportCase from "../components/case/ReportCase";
import './HomePage.css';
import HeroImage from '../assets/child-future-contrast.jpg'; 

function HomePage() {
  const [activeTab, setActiveTab] = useState('login');
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  
  const roles = [
    { title: "End Child Labor", icon: "🤝", description: "Protect children from exploitation and hazardous agricultural work." },
    { title: "Educational Support", icon: "📚", description: "Provide full sponsorship covering fees, books, and uniforms." },
    { title: "Community Advocacy", icon: "📣", description: "Raise awareness about child rights and facilitate anonymous reporting." },
    { title: "Transparent Tracking", icon: "✅", description: "Offer sponsors and parents real-time updates on child progress." },
  ];

  const openPanel = (tab) => {
    setActiveTab(tab);
    setIsPanelOpen(true);
  };

  const closeModal = () => setIsPanelOpen(false);

  return (
    <div className="home-page-container">

      {}
      <nav className="auth-top-right">
        <button className="top-tab" onClick={() => openPanel('login')}>Login</button>
        <button className="top-tab register-btn" onClick={() => openPanel('register')}>Register</button>
        <button className="top-tab about-btn" onClick={() => openPanel('about')}>About Us</button>
      </nav>

      {}
      {isPanelOpen && (
        <div className="auth-modal-overlay" onClick={closeModal}>
          <div className="auth-modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={closeModal}>&times;</button>

            <div className="form-body">
              <div className="modal-content-area">
                {activeTab === 'login' && <LoginPage />}
                {activeTab === 'register' && <RegisterPage />}
                {activeTab === 'about' && (
                  <div className="about-us-content">
                    <h2>ChildGuard: Our Mission</h2>
                    <p>
                      ChildGuard is a web-based platform dedicated to protecting children from labor 
                      exploitation by automating educational sponsorship applications and facilitating 
                      anonymous incident reporting.
                    </p>
                    <p>
                      Our mission is to end child labor, support families, and build stronger 
                      communities through transparent collaboration between parents, sponsors, and NGOs.
                    </p>
                    <button className="cta-btn" onClick={() => openPanel('register')}>Join the Cause</button>
                  </div>
                )}
                {activeTab === 'report' && <ReportCase userId={null} />} {/* null for anonymous */}
              </div>
            </div>
          </div>
        </div>
      )}

      {}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Protecting Children, Building Futures</h1>
          <p className="hero-subtitle">
            A centralized platform to end child labor through <b>Educational Sponsorship</b> and <b>Anonymous Reporting</b>.
          </p>
          <div className="hero-buttons">
            <button className="cta-btn" onClick={() => openPanel('register')}>Sponsor a Child Today</button>
            <button className="cta-btn-outline" onClick={() => openPanel('report')}>Report a Case</button>
          </div>
        </div>
        <div className="hero-image">
          <img src={HeroImage} alt="Contrast between child in school uniform and child labor" />
        </div>
      </section>

      {}
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

      {}
      <footer className="footer">
        &copy; 2025 ChildGuard. All Rights Reserved.
      </footer>
    </div>
  );
}

export default HomePage;
