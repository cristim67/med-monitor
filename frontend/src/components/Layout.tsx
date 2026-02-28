import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, LogOut, Activity, Sun, Moon, Menu, X, ClipboardList, Shield } from 'lucide-react';
import api from '../api/axios';
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
  
  // Sync role with backend to prevent stale localStorage
  useEffect(() => {
    const syncRole = async () => {
      try {
        const res = await api.get('/api/v1/profile');
        const latestRole = res.data.Role;
        const latestName = res.data.Name;
        const latestPicture = res.data.Picture;

        let changed = false;
        if (latestRole && latestRole !== role) {
          localStorage.setItem('user_role', latestRole);
          changed = true;
        }
        if (latestName && latestName !== localStorage.getItem('user_name')) {
          localStorage.setItem('user_name', latestName);
          changed = true;
        }
        if (latestPicture !== localStorage.getItem('user_picture')) {
          localStorage.setItem('user_picture', latestPicture || '');
          changed = true;
        }

        if (changed) {
          console.log('Profile updated from sync');
          window.location.reload(); 
        }
      } catch (err) {
        console.error('Failed to sync profile', err);
      }
    };
    if (token) syncRole();
  }, [token, role]);

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
        />
      )}

      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="pulse-primary" style={{ width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary)' }}>
            <Activity color="white" size={18} />
          </div>
          <span style={{ fontWeight: 900, letterSpacing: '-0.02em', fontSize: '18px' }}>MedMonitor</span>
          <button 
            className="theme-toggle" 
            onClick={() => setIsSidebarOpen(false)} 
            style={{ marginLeft: 'auto', display: window.innerWidth <= 768 ? 'flex' : 'none' }}>
            <X size={20} />
          </button>
        </div>

        <nav className="nav-menu">
          <div className="nav-section-label">General</div>
          <NavLink to="/" className={({isActive}: {isActive: boolean}) => `nav-link ${isActive ? 'active' : ''}`} end onClick={() => setIsSidebarOpen(false)}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink to="/appointments" className={({isActive}: {isActive: boolean}) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
            <Calendar size={18} />
            <span>Appointments</span>
          </NavLink>

          <div className="nav-section-label" style={{ marginTop: '20px' }}>Clinical</div>
          {(role === 'admin' || role === 'doctor') && (
            <NavLink to="/patients" className={({isActive}: {isActive: boolean}) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
              <Users size={18} />
              <span>Patients</span>
            </NavLink>
          )}

          <NavLink to="/prescriptions" className={({isActive}: {isActive: boolean}) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
            <ClipboardList size={18} />
            <span>Prescriptions</span>
          </NavLink>

          {role === 'admin' && (
            <>
              <div className="nav-section-label" style={{ marginTop: '20px' }}>Security</div>
              <NavLink to="/admin/users" className={({isActive}: {isActive: boolean}) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
                <Shield size={18} />
                <span>User Management</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>Theme</span>
            <button className="theme-toggle" onClick={toggleTheme} style={{ padding: '6px', borderRadius: '10px' }}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
          <div className="user-profile">
            <div style={{ position: 'relative' }}>
              <img 
                src={userAvatar} 
                alt="User Avatar" 
                className="user-avatar" 
                referrerPolicy="no-referrer"
              />
              <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '12px', height: '12px', background: 'var(--success)', border: '2px solid var(--bg-surface)', borderRadius: '50%' }} />
            </div>
            <div className="user-info">
              <div className="user-name">{name}</div>
              <div className="badge badge-primary" style={{ fontSize: '9px', padding: '2px 6px', marginTop: '2px', textTransform: 'uppercase' }}>{role}</div>
            </div>
            <button onClick={handleLogout} className="logout-button" title="Logout">
              <LogOut size={18} />
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
