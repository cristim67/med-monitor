import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Shield, Mail, Search, Clock, X, Stethoscope, Building2 } from 'lucide-react';

interface UserData {
  ID: number;
  Email: string;
  Name: string;
  Role: string;
  Picture: string;
}

interface Department {
  ID: number;
  Name: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<number | null>(null);

  // Modal State for Doctor Assignment
  const [showDoctorModal, setShowDoctorModal] = useState<UserData | null>(null);
  const [selectedDept, setSelectedDept] = useState('');
  const [specialization, setSpecialization] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, deptsRes] = await Promise.all([
        api.get('/api/v1/users'),
        api.get('/api/v1/departments')
      ]);
      setUsers(usersRes.data || []);
      setDepartments(deptsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (user: UserData, newRole: string) => {
    if (newRole === 'doctor') {
      setShowDoctorModal(user);
      setSelectedDept('');
      setSpecialization('');
    } else {
      updateUserRole(user.ID, newRole);
    }
  };

  const updateUserRole = async (userId: number, newRole: string, deptId?: number, spec?: string) => {
    setUpdating(userId);
    try {
      await api.put(`/api/v1/users/${userId}/role`, { 
        role: newRole,
        department_id: deptId,
        specialization: spec
      });
      await fetchData(); 
      setShowDoctorModal(null);
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
                        onChange={(e) => handleRoleChange(user, e.target.value)}
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

      {/* Doctor Settings Modal */}
      {showDoctorModal && (
        <div className="modal-overlay" onClick={() => setShowDoctorModal(null)}>
          <div className="modal-content glass-panel" style={{ maxWidth: 'calc(500 / 16 * 1rem)' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: 'calc(24 / 16 * 1rem)', fontWeight: 800 }}>Clinical specialization</h2>
              <button className="theme-toggle" onClick={() => setShowDoctorModal(null)}><X size={20} /></button>
            </div>
            <div style={{ marginTop: '24px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '16px', marginBottom: '24px' }}>
                  <img src={showDoctorModal.Picture} alt="" style={{ width: '48px', height: '48px', borderRadius: '12px' }} />
                  <div>
                    <div style={{ fontWeight: 800 }}>{showDoctorModal.Name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Assiging Doctor profile</div>
                  </div>
               </div>

               <div className="form-group">
                  <label className="form-label">Medical Department</label>
                  <div style={{ position: 'relative' }}>
                    <Building2 size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                    <select 
                      className="form-control" 
                      style={{ paddingLeft: '44px', borderRadius: '14px' }}
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                    >
                       <option value="">Select department...</option>
                       {departments.map(d => <option key={d.ID} value={d.ID}>{d.Name}</option>)}
                    </select>
                  </div>
               </div>

               <div className="form-group" style={{ marginTop: '16px' }}>
                  <label className="form-label">Clinical Specialization</label>
                  <div style={{ position: 'relative' }}>
                    <Stethoscope size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Senior Cardiologist" 
                      style={{ paddingLeft: '44px', borderRadius: '14px' }}
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                    />
                  </div>
               </div>

               <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                  <button 
                    disabled={updating !== null || !selectedDept}
                    onClick={() => updateUserRole(showDoctorModal.ID, 'doctor', parseInt(selectedDept), specialization)}
                    className="btn btn-primary" 
                    style={{ flex: 1.5, borderRadius: '14px' }}
                  >
                    Confirm Doctor Role
                  </button>
                  <button className="btn" style={{ flex: 1, borderRadius: '14px' }} onClick={() => setShowDoctorModal(null)}>Cancel</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
