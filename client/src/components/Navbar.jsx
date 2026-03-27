import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const links = [
  { to: '/', label: 'Home' },
  { to: '/pantry', label: 'Pantry' },
  { to: '/recommendations', label: 'Meals' },
  { to: '/expenses', label: 'Expenses' },
  { to: '/trending', label: 'Trending' },
  { to: '/chat', label: 'Remy' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    setDropOpen(false);
    logout();
    navigate('/login');
  };

  const handleSaves = () => {
    setDropOpen(false);
    navigate('/saves');
  };

  const handleSettings = () => {
    setDropOpen(false);
    navigate('/settings');
  };

  return (
    <nav className="navbar">
      <span className="navbar-brand">MoodMeal</span>

      <div className="navbar-links">
        {links.map(l => (
          <NavLink key={l.to} to={l.to} end={l.to === '/'}
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            {l.label}
          </NavLink>
        ))}
      </div>

      {/* User dropdown */}
      <div className="navbar-user" ref={dropRef}>
        <button className="user-pill" onClick={() => setDropOpen(o => !o)}>
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span className="user-name">{user?.name?.split(' ')[0]}</span>
          <svg className={`chevron ${dropOpen ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {dropOpen && (
          <div className="user-dropdown">
            <div className="dropdown-info">
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
            </div>
            <div className="dropdown-divider" />
            <button className="dropdown-item" onClick={handleSaves}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              My Saves
            </button>
            <button className="dropdown-item" onClick={handleSettings}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              Settings
            </button>
            <div className="dropdown-divider" />
            <button className="dropdown-item logout-item" onClick={handleLogout}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

