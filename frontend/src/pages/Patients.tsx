import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search, Mail, ChevronRight, X, User, Calendar, Pill, FileText, Clock } from 'lucide-react';

interface Patient {
  id: number;
  gender: string;
  date_of_birth: string;
  user: {
    name: string;
    email: string;
    picture: string;
  };
}

interface History {
  appointments: any[];
  prescriptions: any[];
}

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Detail State
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [history, setHistory] = useState<History | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await api.get('/api/v1/patients');
      setPatients(res.data || []);
    } catch (err) {
      console.error('Failed to fetch patients', err);
    } finally {
      setLoading(false);
    }
  };

  const viewPatientDetails = async (patient: Patient) => {
    setSelectedPatient(patient);
    setLoadingHistory(true);
    try {
      const res = await api.get(`/api/v1/patients/${patient.id}/history`);
      setHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <User className="brand-icon" size={32} style={{ animation: 'pulse 2s infinite' }} />
    </div>
  );

  return (
    <div className="patients-page">
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <h1 className="page-title">Patient Records</h1>
        <p className="page-subtitle">Centralized medical history and demographic data</p>
      </div>

      <div className="glass-panel" style={{ padding: '20px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Search size={20} color="var(--text-muted)" />
        <input 
          type="text" 
          placeholder="Search by name, email or medical ID..." 
          className="form-control"
          style={{ border: 'none', background: 'transparent', padding: 0, boxShadow: 'none' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--card-border)' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>PATIENT</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>CONTACT</th>
              <th style={{ padding: '16px 24px', textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--card-border)', transition: 'background 0.2s' }} className="table-row-hover">
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <img src={p.user.picture || `https://ui-avatars.com/api/?name=${p.user.name}`} alt="" style={{ width: '40px', height: '40px', borderRadius: '12px', border: '1px solid var(--card-border)' }} />
                    <div style={{ fontWeight: 600 }}>{p.user.name}</div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={14} /> {p.user.email}
                  </div>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <button className="btn" style={{ padding: '8px 16px' }} onClick={() => viewPatientDetails(p)}>
                    Details <ChevronRight size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <div className="modal-overlay" onClick={() => setSelectedPatient(null)}>
          <div className="modal-content glass-panel" style={{ maxWidth: '800px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                 <img src={selectedPatient.user.picture || `https://ui-avatars.com/api/?name=${selectedPatient.user.name}`} alt="" style={{ width: '64px', height: '64px', borderRadius: '16px' }} />
                 <div>
                    <h2 style={{ marginBottom: '4px' }}>{selectedPatient.user.name}</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Medical Record ID: #{selectedPatient.id.toString().padStart(5, '0')}</p>
                 </div>
              </div>
              <button className="theme-toggle" onClick={() => setSelectedPatient(null)}><X size={20} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', marginTop: '32px' }}>
               {/* Left Spane: Info */}
               <div>
                  <h3 style={{ fontSize: '16px', marginBottom: '20px', color: 'var(--primary)' }}>Patient Info</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                     <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>EMAIL ADDRESS</div>
                        <div style={{ fontSize: '14px' }}>{selectedPatient.user.email}</div>
                     </div>
                     {selectedPatient.date_of_birth && (
                       <div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>DATE OF BIRTH</div>
                          <div style={{ fontSize: '14px' }}>{new Date(selectedPatient.date_of_birth).toLocaleDateString()}</div>
                       </div>
                     )}
                     {selectedPatient.gender && (
                       <div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>GENDER</div>
                          <div style={{ fontSize: '14px' }}>{selectedPatient.gender}</div>
                       </div>
                     )}
                  </div>
               </div>

               {/* Right Pane: History */}
               <div style={{ borderLeft: '1px solid var(--card-border)', paddingLeft: '32px' }}>
                  <h3 style={{ fontSize: '16px', marginBottom: '20px', color: 'var(--primary)' }}>Medical History</h3>
                  
                  {loadingHistory ? (
                     <div style={{ padding: '40px', textAlign: 'center' }}><Clock style={{ animation: 'pulse 2s infinite' }} /></div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                       {/* Last Appointments */}
                       <div>
                          <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                             <Calendar size={16} /> Past Appointments
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                             {history?.appointments.filter(a => a.status === 'Completed').slice(0, 3).map(a => (
                                <div key={a.id} style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '10px', fontSize: '13px' }}>
                                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                      <span style={{ fontWeight: 600 }}>{new Date(a.appointment_date).toLocaleDateString()}</span>
                                      <span className="status-badge completed">Completed</span>
                                   </div>
                                   <div style={{ color: 'var(--text-muted)' }}>Dr. {a.doctor.user.name} ({a.doctor.department.name})</div>
                                </div>
                             ))}
                             {(!history?.appointments || history.appointments.filter(a => a.status === 'Completed').length === 0) && (
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '12px', border: '1px dashed var(--card-border)', borderRadius: '10px' }}>No past consultations found.</div>
                             )}
                          </div>
                       </div>

                       {/* Active Prescriptions */}
                       <div>
                          <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                             <Pill size={16} /> Recent Prescriptions
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                             {history?.prescriptions.slice(0, 3).map(p => (
                                <div key={p.id} style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '10px', fontSize: '13px' }}>
                                   <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{p.medication} <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '12px' }}>({p.dosage})</span></div>
                                   <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Issued by Dr. {p.consultation.appointment.doctor.user.name}</div>
                                </div>
                             ))}
                             {(!history?.prescriptions || history.prescriptions.length === 0) && (
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '12px', border: '1px dashed var(--card-border)', borderRadius: '10px' }}>No active prescriptions.</div>
                             )}
                          </div>
                       </div>
                    </div>
                  )}
               </div>
            </div>
            
            <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--card-border)', display: 'flex', gap: '12px' }}>
               <button className="btn btn-primary" style={{ padding: '10px 24px' }}><FileText size={18} /> Export Health Record</button>
               <button className="btn" onClick={() => setSelectedPatient(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
