// src/components/NavBar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css'; 

function NavBar({ user, onLogout, openPanel }) {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Determine label: Show 'Dashboard' if on Home OR About page
  const getDynamicLabel = () => {
    if (!user) return null;
    // If on Landing Page (/) or About Page (/about), offer a link to Dashboard
    if (location.pathname === '/' || location.pathname === '/about') {
      return 'Dashboard';
    }
    // If on the Dashboard already, offer a link to Home
    return 'Home';
  };

  // 2. Handle Click: Navigate correctly based on current page
  const handleDynamicClick = () => {
    // If on Home OR About, go to specific Dashboard
    if (user && (location.pathname === '/' || location.pathname === '/about')) {
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
    } else {
      // If currently on a Dashboard, go Home
      navigate('/');
    }
  };

  const handleAuthClick = (type) => {
    if (location.pathname === '/') {
      openPanel(type);
    } else {
      navigate('/', { state: { openAuthPanel: type } });
    }
  };

  return (
    <>
      <nav className="navbar">
        {/* Logo */}
        <div className="navbar-logo" onClick={() => navigate('/')}>
          ChildGuard
        </div>

        <div className="navbar-links">
          
          {/* About Us - Always visible */}
          <button className="nav-btn" onClick={() => navigate('/about')}>
            About Us
          </button>

          {user ? (
            /* --- LOGGED IN USER LINKS --- */
            <>
              {/* Button now says "Dashboard" when on /about */}
              <button className="nav-btn" onClick={handleDynamicClick}>
                {getDynamicLabel()}
              </button>
              
              <button className="nav-btn" onClick={() => navigate('/dashboard')}>
                Profile
              </button>
              
              <button className="nav-btn logout-btn" onClick={onLogout}>
                Sign Out
              </button>
            </>
          ) : (
            /* --- GUEST LINKS --- */
            // Check if we are on the About Page
            location.pathname === '/about' ? (
              // Show a Home Link when on About Page for guests
              <button className="nav-btn" onClick={() => navigate('/')}>
                Home
              </button>
            ) : (
              // Show Login/Register on all other pages
              <>
                <button className="nav-btn" onClick={() => handleAuthClick('login')}>
                  Login
                </button>
                <button className="nav-btn" onClick={() => handleAuthClick('register')}>
                  Register
                </button>
              </>
            )
          )}
        </div>
      </nav>
      <div className="navbar-spacer"></div>
    </>
  );
}

export default NavBar;