import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Calendar, Clock, User, Plus, CheckCircle, X, Pill, Trash2 } from 'lucide-react';

interface Appointment {
  ID: number;
  AppointmentDate: string;
  Status: string;
  Doctor: {
    User: { Name: string };
    Department: { Name: string };
  };
  Patient: {
    User: { Name: string };
  };
}

interface Doctor {
  ID: number;
  User: { Name: string };
  Department: { Name: string };
  Specialization: string;
}

interface Medication {
  medication: string;
  dosage: string;
}

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showBookModal, setShowBookModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState<number | null>(null);

  // Form States
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [meds, setMeds] = useState<Medication[]>([]);

  const role = localStorage.getItem('user_role') || 'patient';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [apptsRes, docsRes] = await Promise.all([
        api.get('/api/v1/appointments'),
        api.get('/api/v1/doctors')
      ]);
      setAppointments(apptsRes.data || []);
      setDoctors(docsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/v1/appointments', {
        doctor_id: parseInt(selectedDoctor),
        date: bookingDate,
      });
      setShowBookModal(false);
      resetBookForm();
      fetchData();
    } catch (err) {
      alert('Failed to book appointment');
    }
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showCompleteModal) return;

    try {
      await api.put(`/api/v1/appointments/${showCompleteModal}/complete`, {
        diagnosis,
        notes,
        medications: meds.map(m => ({ medication: m.medication, dosage: m.dosage }))
      });
      setShowCompleteModal(null);
      resetCompleteForm();
      fetchData();
    } catch (err) {
      alert('Failed to complete appointment');
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.put(`/api/v1/appointments/${id}/cancel`);
      fetchData();
    } catch (err) {
      alert('Failed to cancel appointment');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to PERMANENTLY DELETE this appointment? This cannot be undone.')) return;
    try {
      await api.delete(`/api/v1/appointments/${id}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete appointment');
    }
  };

  const resetBookForm = () => {
    setSelectedDoctor('');
    setBookingDate('');
  };

  const resetCompleteForm = () => {
    setDiagnosis('');
    setNotes('');
    setMeds([]);
  };

  const addMed = () => setMeds([...meds, { medication: '', dosage: '' }]);
  const removeMed = (index: number) => setMeds(meds.filter((_, i) => i !== index));
  const updateMed = (index: number, field: keyof Medication, value: string) => {
    const newMeds = [...meds];
    newMeds[index][field] = value;
    setMeds(newMeds);
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <Clock className="brand-icon" size={32} style={{ animation: 'pulse 2s infinite' }} />
    </div>
  );

  return (
    <div className="appointments-page">
      <div className="role-banner" style={{ marginBottom: 'calc(32 / 16 * 1rem)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">Digital appointment scheduler</h1>
            <p className="page-subtitle" style={{ color: 'rgba(255,255,255,0.8)' }}>Optimize clinical workflows and manage medical consultations.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowBookModal(true)} style={{ background: 'white', color: 'var(--primary)', fontWeight: 800, padding: '12px 24px', borderRadius: 'calc(14 / 16 * 1rem)', border: 'none' }}>
            <Plus size={20} /> Reserve slot
          </button>
        </div>
      </div>

      <div className="appointments-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 'calc(24 / 16 * 1rem)' }}>
        {appointments.length === 0 ? (
          <div className="glass-panel" style={{ padding: 'calc(80 / 16 * 1rem)', textAlign: 'center', gridColumn: '1/-1', border: '1px dashed var(--card-border)', background: 'var(--bg-secondary)' }}>
            <Calendar size={60} color="var(--primary)" style={{ marginBottom: 'calc(24 / 16 * 1rem)', opacity: 0.5 }} />
            <h3 style={{ fontSize: 'calc(20 / 16 * 1rem)', fontWeight: 800 }}>No operations recorded</h3>
            <p style={{ color: 'var(--text-dim)', maxWidth: 'calc(300 / 16 * 1rem)', margin: '12px auto' }}>Your medical schedule is currently clear. Scheduled visits will appear here.</p>
          </div>
        ) : (
          appointments.map((appt) => (
            <div key={appt.ID} className="glass-panel action-card" style={{ padding: 'calc(28 / 16 * 1rem)', position: 'relative', cursor: 'default' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'calc(28 / 16 * 1rem)' }}>
                <div className={`badge badge-${appt.Status === 'Completed' ? 'success' : (appt.Status === 'Scheduled' ? 'primary' : 'warning')}`} style={{ textTransform: 'uppercase', letterSpacing: 'calc(1 / 16 * 1rem)', fontSize: 'calc(10 / 16 * 1rem)' }}>
                  {appt.Status}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 'calc(16 / 16 * 1rem)', fontWeight: 800 }}>{new Date(appt.AppointmentDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</div>
                  <div style={{ fontSize: 'calc(13 / 16 * 1rem)', color: 'var(--text-muted)', fontWeight: 500 }}>{new Date(appt.AppointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'calc(20 / 16 * 1rem)', marginBottom: 'calc(32 / 16 * 1rem)' }}>
                <div className="icon-wrapper" style={{ width: 'calc(56 / 16 * 1rem)', height: 'calc(56 / 16 * 1rem)' }}>
                  <User size={24} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 'calc(18 / 16 * 1rem)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column' }}>
                    {role === 'admin' ? (
                      <>
                        <span style={{ fontSize: 'calc(13 / 16 * 1rem)', color: 'var(--text-muted)', marginBottom: 'calc(4 / 16 * 1rem)' }}>OPERATIONAL UNIT</span>
                        <span>{appt.Patient.User.Name} ⇌ {appt.Doctor.User.Name}</span>
                      </>
                    ) : (
                      role === 'doctor' ? appt.Patient.User.Name : appt.Doctor.User.Name
                    )}
                  </div>
                  <div style={{ fontSize: 'calc(14 / 16 * 1rem)', color: 'var(--text-dim)', marginTop: 'calc(4 / 16 * 1rem)', fontWeight: 500 }}>
                    {role === 'admin' ? appt.Doctor.Department.Name : (role === 'doctor' ? 'Clinical Patient' : `Specialist • ${appt.Doctor.Department.Name}`)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'calc(12 / 16 * 1rem)' }}>
                {role === 'doctor' && appt.Status === 'Scheduled' && (
                  <button 
                    onClick={() => setShowCompleteModal(appt.ID)}
                    className="btn btn-primary" 
                    style={{ flex: 1, gap: 'calc(10 / 16 * 1rem)', borderRadius: 'calc(14 / 16 * 1rem)', padding: 'calc(12 / 16 * 1rem)' }}
                  >
                    <CheckCircle size={18} /> Process clinical visit
                  </button>
                )}
                
                {appt.Status === 'Scheduled' && (
                  <button 
                    onClick={() => handleCancel(appt.ID)}
                    className="btn" 
                    style={{ flex: 1, gap: 'calc(8 / 16 * 1rem)', background: 'rgba(239, 68, 68, 0.05)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: 'calc(14 / 16 * 1rem)' }}
                  >
                    <Trash2 size={18} /> Terminate
                  </button>
                )}

                {role === 'admin' && (
                  <button 
                    onClick={() => handleDelete(appt.ID)}
                    className="btn" 
                    style={{ flex: 1, gap: 'calc(8 / 16 * 1rem)', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: 'calc(14 / 16 * 1rem)' }}
                  >
                    <Trash2 size={18} /> Purge record
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Booking Modal */}
      {showBookModal && (
        <div className="modal-overlay" onClick={() => setShowBookModal(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: 'calc(500 / 16 * 1rem)' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: 'calc(24 / 16 * 1rem)', fontWeight: 800 }}>Clinical booking</h2>
              <button className="theme-toggle" onClick={() => setShowBookModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleBook} style={{ marginTop: 'calc(24 / 16 * 1rem)' }}>
              <div className="form-group">
                <label className="form-label">Medical specialist</label>
                <select 
                  className="form-control"
                  style={{ borderRadius: 'calc(14 / 16 * 1rem)', padding: 'calc(14 / 16 * 1rem)' }}
                  value={selectedDoctor} 
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  required
                >
                  <option value="">Choose your specialist...</option>
                  {doctors.map(doc => (
                    <option key={doc.ID} value={doc.ID}>{doc.User.Name} — {doc.Department.Name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Appointment timeline</label>
                <input 
                  type="datetime-local" 
                  className="form-control"
                  style={{ borderRadius: 'calc(14 / 16 * 1rem)', padding: 'calc(14 / 16 * 1rem)' }}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: 'calc(16 / 16 * 1rem)', marginTop: 'calc(40 / 16 * 1rem)' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1.5, borderRadius: 'calc(14 / 16 * 1rem)', padding: 'calc(14 / 16 * 1rem)' }}>Initialize booking</button>
                <button type="button" className="btn" style={{ flex: 1, borderRadius: 'calc(14 / 16 * 1rem)' }} onClick={() => setShowBookModal(false)}>Discard</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {showCompleteModal && (
        <div className="modal-overlay" onClick={() => setShowCompleteModal(null)}>
          <div className="modal-content glass-panel" style={{ maxWidth: 'calc(700 / 16 * 1rem)' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: 'calc(24 / 16 * 1rem)', fontWeight: 800 }}>Process clinical encounter</h2>
              <button className="theme-toggle" onClick={() => setShowCompleteModal(null)}><X size={20} /></button>
            </div>
            <form onSubmit={handleComplete} style={{ marginTop: 'calc(24 / 16 * 1rem)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'calc(24 / 16 * 1rem)' }}>
                  <div className="form-group">
                    <label className="form-label">Clinical diagnosis</label>
                    <input 
                      className="form-control" 
                      style={{ borderRadius: 'calc(14 / 16 * 1rem)' }}
                      placeholder="Enter verified diagnosis..."
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Consultation ID</label>
                    <div className="badge badge-primary" style={{ display: 'block', padding: 'calc(12 / 16 * 1rem)' }}>SESSION_ID: #{showCompleteModal.toString().padStart(6, '0')}</div>
                  </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Medical observations & notes</label>
                <textarea 
                  className="form-control" 
                  style={{ borderRadius: 'calc(14 / 16 * 1rem)', minHeight: 'calc(120 / 16 * 1rem)' }}
                  placeholder="Analyze clinical symptoms and provide treatment notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginTop: 'calc(32 / 16 * 1rem)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'calc(20 / 16 * 1rem)' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Active prescriptions</label>
                  <button type="button" className="btn btn-primary" style={{ padding: '6px 16px', fontSize: 'calc(12 / 16 * 1rem)', borderRadius: 'calc(10 / 16 * 1rem)' }} onClick={addMed}>
                    <Plus size={14} /> Add drug
                  </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'calc(12 / 16 * 1rem)' }}>
                  {meds.map((med, index) => (
                    <div key={index} className="data-row" style={{ display: 'flex', gap: 'calc(12 / 16 * 1rem)', alignItems: 'center', background: 'var(--bg-secondary)', padding: 'calc(12 / 16 * 1rem)', borderRadius: 'calc(14 / 16 * 1rem)' }}>
                      <div style={{ flex: 2 }}>
                        <input 
                          className="form-control" 
                          style={{ border: 'none', background: 'var(--bg-surface)' }}
                          placeholder="Medication name"
                          value={med.medication}
                          onChange={(e) => updateMed(index, 'medication', e.target.value)}
                          required
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <input 
                          className="form-control" 
                          style={{ border: 'none', background: 'var(--bg-surface)' }}
                          placeholder="Dosage"
                          value={med.dosage}
                          onChange={(e) => updateMed(index, 'dosage', e.target.value)}
                          required
                        />
                      </div>
                      <button type="button" className="theme-toggle" style={{ color: 'var(--danger)', padding: 'calc(10 / 16 * 1rem)' }} onClick={() => removeMed(index)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
                
                {meds.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 'calc(40 / 16 * 1rem)', background: 'var(--bg-secondary)', borderRadius: 'calc(20 / 16 * 1rem)', color: 'var(--text-dim)', fontSize: 'calc(13 / 16 * 1rem)', border: '1px dashed var(--card-border)' }}>
                    <Pill size={32} style={{ marginBottom: 'calc(12 / 16 * 1rem)', opacity: 0.3 }} />
                    <div style={{ fontWeight: 600 }}>No drugs assigned to this visit</div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 'calc(16 / 16 * 1rem)', marginTop: 'calc(40 / 16 * 1rem)' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1.5, borderRadius: 'calc(14 / 16 * 1rem)', padding: 'calc(14 / 16 * 1rem)' }}>Confirm synchronization</button>
                <button type="button" className="btn" style={{ flex: 1, borderRadius: 'calc(14 / 16 * 1rem)' }} onClick={() => setShowCompleteModal(null)}>Discard</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
