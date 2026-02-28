import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Shield, Mail, Search, Clock } from 'lucide-react';

interface UserData {
  ID: number;
  Email: string;
  Name: string;
  Role: string;
  Picture: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/v1/users');
      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: number, newRole: string) => {
    setUpdating(userId);
    try {
      await api.put(`/api/v1/users/${userId}/role`, { role: newRole });
      await fetchUsers(); // Refresh
    } catch (err) {
      console.error('Failed to update role', err);
      alert('Failed to update role. Check permissions.');
    } finally {
      setUpdating(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.Name.toLowerCase().includes(search.toLowerCase()) || 
    u.Email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 'calc(1200 / 16 * 1rem)', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
      <div className="page-header">
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'calc(12 / 16 * 1rem)' }}>
          <Shield color="var(--primary)" size={32} />
          User Management
        </h1>
        <p className="page-subtitle" style={{ marginBottom: 'calc(16 / 16 * 1rem)', marginTop: 'calc(8 / 16 * 1rem)' }}>Control access levels and assign medical roles to system users.</p>
      </div>

      <div className="glass-panel" style={{ padding: 'calc(24 / 16 * 1rem)', marginBottom: 'calc(32 / 16 * 1rem)', display: 'flex', gap: 'calc(16 / 16 * 1rem)', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search style={{ position: 'absolute', left: 'calc(12 / 16 * 1rem)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="form-control"
            style={{ paddingLeft: 'calc(40 / 16 * 1rem)' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ fontSize: 'calc(14 / 16 * 1rem)', color: 'var(--text-muted)', fontWeight: 500 }}>
          {filteredUsers.length} Users Found
        </div>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--card-border)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '16px 24px', fontSize: 'calc(13 / 16 * 1rem)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User</th>
              <th style={{ padding: '16px 24px', fontSize: 'calc(13 / 16 * 1rem)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
              <th style={{ padding: '16px 24px', fontSize: 'calc(13 / 16 * 1rem)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} style={{ padding: 'calc(60 / 16 * 1rem)', textAlign: 'center' }}>Loading users...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={3} style={{ padding: 'calc(60 / 16 * 1rem)', textAlign: 'center' }}>No users found matching your search.</td></tr>
            ) : filteredUsers.map(user => (
              <tr key={user.ID} style={{ borderBottom: '1px solid var(--card-border)', transition: 'background 0.2s' }} className="table-row-hover">
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'calc(16 / 16 * 1rem)' }}>
                    <img 
                      src={user.Picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.Name)}&background=3b82f6&color=fff`} 
                      alt="" 
                      style={{ width: 'calc(40 / 16 * 1rem)', height: 'calc(40 / 16 * 1rem)', borderRadius: 'calc(10 / 16 * 1rem)', objectFit: 'cover' }}
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 'calc(15 / 16 * 1rem)' }}>{user.Name}</div>
                      <div style={{ fontSize: 'calc(13 / 16 * 1rem)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 'calc(4 / 16 * 1rem)' }}>
                        <Mail size={12} /> {user.Email}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <span className={`status-badge ${user.Role}`}>
                    {user.Role}
                  </span>
                </td>
                <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                   <div style={{ display: 'flex', gap: 'calc(8 / 16 * 1rem)', justifyContent: 'flex-end' }}>
                      <select 
                        className="form-control" 
                        style={{ width: 'auto', padding: '4px 8px', fontSize: 'calc(13 / 16 * 1rem)' }}
                        value={user.Role}
                        disabled={updating === user.ID}
                        onChange={(e) => updateUserRole(user.ID, e.target.value)}
                      >
                        <option value="patient">Patient</option>
                        <option value="doctor">Doctor</option>
                        <option value="admin">Admin</option>
                      </select>
                      {updating === user.ID && <Clock size={18} className="spin" style={{ alignSelf: 'center' }} />}
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
