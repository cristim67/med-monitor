import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, LogOut, Activity, Sun, Moon, Menu, X, ClipboardList, Shield } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

interface GoogleJwtPayload {
  name?: string;
  picture?: string;
  email?: string;
}

import { useTheme } from '../context/ThemeContext';

export default function Layout() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_role');
    navigate('/login');
  };

  const token = localStorage.getItem('token') || '';
  const role = localStorage.getItem('user_role') || 'patient';
  let name = 'User';
  let picture = '';
  
  try {
    if (token) {
      const decoded = jwtDecode<GoogleJwtPayload>(token);
      name = decoded.name || 'User';
      picture = decoded.picture || '';
    }
  } catch (e) {
    console.error('Failed to decode token', e);
  }

  const userAvatar = picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=128`;
  
  // Debug profile info once
  useEffect(() => {
    console.log('User Profile:', { name, picture, role });
  }, [name, picture, role]);

  return (
    <div className="app-layout">
      {/* Mobile Header */}
      <header className="mobile-header">
        <button className="theme-toggle" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <div className="brand" style={{ marginBottom: 0 }}>
          <Activity className="brand-icon" />
          <span>MedMonitor</span>
        </div>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 95
          }}
        />
      )}

      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="brand">
          <Activity className="brand-icon" />
          <span>MedMonitor</span>
          <button 
            className="theme-toggle" 
            onClick={() => setIsSidebarOpen(false)} 
            style={{ marginLeft: 'auto', display: window.innerWidth <= 768 ? 'flex' : 'none' }}>
            <X size={20} />
          </button>
        </div>

        <nav className="nav-menu">
          <NavLink to="/" className={({isActive}: {isActive: boolean}) => `nav-link ${isActive ? 'active' : ''}`} end onClick={() => setIsSidebarOpen(false)}>
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>
          
          <NavLink to="/appointments" className={({isActive}: {isActive: boolean}) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
            <Calendar size={20} />
            Appointments
          </NavLink>

          {(role === 'admin' || role === 'doctor') && (
            <NavLink to="/patients" className={({isActive}: {isActive: boolean}) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
              <Users size={20} />
              Patients
            </NavLink>
          )}

          {role === 'admin' && (
            <NavLink to="/admin/users" className={({isActive}: {isActive: boolean}) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
              <Shield size={20} />
              User Management
            </NavLink>
          )}

          <NavLink to="/prescriptions" className={({isActive}: {isActive: boolean}) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
            <ClipboardList size={20} />
            Prescriptions
          </NavLink>
        </nav>

        <div className="sidebar-footer" style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <button className="theme-toggle" onClick={toggleTheme} style={{ width: '100%', justifyContent: 'flex-start', gap: '12px', padding: '12px 16px' }}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            <span style={{ fontSize: '14px', fontWeight: 500 }}>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <div className="user-profile">
            <img 
              src={userAvatar} 
              alt="User Avatar" 
              className="user-avatar" 
              referrerPolicy="no-referrer"
            />
            <div className="user-info">
              <div className="user-name">{name}</div>
              <div className="user-role">{role}</div>
            </div>
            <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: 'auto' }}>
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
