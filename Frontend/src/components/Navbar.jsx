// src/components/NavBar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css'; 

function NavBar({ user, onLogout, openPanel }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine dynamic label for the first button
  const getDynamicLabel = () => {
    if (!user) return null;
    return location.pathname === '/' ? 'Dashboard' : 'Home';
  };

  const handleDynamicClick = () => {
    if (!user) return openPanel('login');

    if (location.pathname === '/') {
      // Navigate to the correct dashboard based on role
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
      navigate('/');
    }
  };

  return (
    <>
      <nav className="navbar">
        {/* Logo */}
        <div className="navbar-logo" onClick={() => navigate('/')}>
          ChildGuard
        </div>

        {/* Navigation Links */}
        <div className="navbar-links">
          {user ? (
            <>
              {/* Dynamic Home/Dashboard button */}
              <button className="nav-btn" onClick={handleDynamicClick}>
                {getDynamicLabel()}
              </button>

              {/* Profile button */}
              <button className="nav-btn" onClick={() => navigate('/dashboard')}>
                Profile
              </button>

              {/* Logout button */}
              <button className="nav-btn logout-btn" onClick={onLogout}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              {/* Login/Register/About buttons for guests */}
              <button className="nav-btn" onClick={() => openPanel('login')}>
                Login
              </button>
              <button className="nav-btn" onClick={() => openPanel('register')}>
                Register
              </button>
              <button className="nav-btn" onClick={() => navigate('/about')}>
                About Us
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Spacer to prevent content overlap */}
      <div className="navbar-spacer"></div>
    </>
  );
}

export default NavBar;
