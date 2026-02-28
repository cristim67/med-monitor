import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Activity, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Login() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (credentialResponse.credential) {
        // Save the google token
        localStorage.setItem('token', credentialResponse.credential);
        
        // Fetch profile to get Role
        const res = await api.get('/api/v1/profile');
        if (res.status === 200) {
          localStorage.setItem('user_role', res.data.role);
          localStorage.setItem('user_name', res.data.name);
          localStorage.setItem('user_picture', res.data.picture);
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Login Failed', error);
    }
  };

  return (
    <div className="auth-container" style={{ position: 'relative' }}>
      <button 
        className="theme-toggle" 
        onClick={toggleTheme}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px'
        }}
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="auth-card glass-panel">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <Activity size={48} color="var(--primary)" />
        </div>
        <h1 className="auth-logo">Med Monitor</h1>
        <p className="auth-subtitle">Secure access to patient data</p>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <GoogleLogin
             onSuccess={handleSuccess}
             onError={() => console.log('Login failed')}
             theme={theme === 'dark' ? "filled_black" : "outline"}
             shape="pill"
          />
        </div>
      </div>
    </div>
  );
}
