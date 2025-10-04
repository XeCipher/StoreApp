import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isDashboardPage = location.pathname === '/' || location.pathname.includes('dashboard');
  const isSettingsPage = location.pathname === '/update-password';

  return (
    <nav style={{ background: '#333', color: '#fff', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontSize: '1.5rem' }}>StoreApp</Link>
      <div>
        {auth.token ? (
          // View for logged-in users
          <>
            {isSettingsPage && (
              <Link to="/" style={{ color: '#fff', textDecoration: 'none', marginRight: '1rem' }}>
                Dashboard
              </Link>
            )}
            {isDashboardPage && (
              <Link to="/update-password" style={{ color: '#fff', textDecoration: 'none', marginRight: '1rem' }}>
                Settings
              </Link>
            )}
            <button onClick={handleLogout} style={{ background: 'grey', color: 'white', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer' }}>
              Logout
            </button>
          </>
        ) : (
          // View for logged-out users
          <>
            {location.pathname !== '/login' && (
              <Link to="/login" style={{ color: '#fff', textDecoration: 'none', marginRight: '1rem' }}>
                Login
              </Link>
            )}
            {location.pathname !== '/register' && (
              <Link to="/register" style={{ color: '#fff', textDecoration: 'none' }}>
                Register
              </Link>
            )}
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
