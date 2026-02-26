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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="page-subtitle">Manage your medical schedule and consultations</p>
        </div>
        {role === 'patient' && (
          <button className="btn btn-primary" onClick={() => setShowBookModal(true)}>
            <Plus size={18} /> Book Appointment
          </button>
        )}
      </div>

      <div className="appointments-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        {appointments.length === 0 ? (
          <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', gridColumn: '1/-1' }}>
            <Calendar size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
            <p style={{ color: 'var(--text-muted)' }}>No appointments scheduled yet.</p>
          </div>
        ) : (
          appointments.map((appt) => (
            <div key={appt.ID} className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <span className={`status-badge ${appt.Status.toLowerCase()}`}>
                  {appt.Status}
                </span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{new Date(appt.AppointmentDate).toLocaleDateString()}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(appt.AppointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--card-border)' }}>
                  <User size={24} color="var(--primary)" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '16px' }}>
                    {role === 'admin' ? (
                      <>
                        <div style={{ fontSize: '14px' }}>P: {appt.Patient.User.Name}</div>
                        <div style={{ fontSize: '14px' }}>D: {appt.Doctor.User.Name}</div>
                      </>
                    ) : (
                      role === 'doctor' ? appt.Patient.User.Name : appt.Doctor.User.Name
                    )}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {role === 'admin' ? appt.Doctor.Department.Name : (role === 'doctor' ? 'Patient' : appt.Doctor.Department.Name)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {role === 'doctor' && appt.Status === 'Scheduled' && (
                  <button 
                    onClick={() => setShowCompleteModal(appt.ID)}
                    className="btn btn-primary" 
                    style={{ width: '100%', gap: '8px' }}
                  >
                    <CheckCircle size={18} /> Start Consultation
                  </button>
                )}
                
                {appt.Status === 'Scheduled' && (
                  <button 
                    onClick={() => handleCancel(appt.ID)}
                    className="btn" 
                    style={{ width: '100%', gap: '8px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}
                  >
                    <Trash2 size={18} /> Cancel Appointment
                  </button>
                )}

                {role === 'admin' && (
                  <button 
                    onClick={() => handleDelete(appt.ID)}
                    className="btn" 
                    style={{ width: '100%', gap: '8px', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)', border: '1px solid var(--danger)' }}
                  >
                    <Trash2 size={18} /> Delete Permanently
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Booking Modal */}
      {showBookModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h2>New Appointment</h2>
              <button className="theme-toggle" onClick={() => setShowBookModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleBook}>
              <div className="form-group">
                <label className="form-label">Specialist</label>
                <select 
                  className="form-control"
                  value={selectedDoctor} 
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  required
                >
                  <option value="">Choose a doctor...</option>
                  {doctors.map(doc => (
                    <option key={doc.ID} value={doc.ID}>{doc.User.Name} - {doc.Department.Name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date & Time</label>
                <input 
                  type="datetime-local" 
                  className="form-control"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Confirm Booking</button>
                <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setShowBookModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {showCompleteModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Consultation Details</h2>
              <button className="theme-toggle" onClick={() => setShowCompleteModal(null)}><X size={20} /></button>
            </div>
            <form onSubmit={handleComplete}>
              <div className="form-group">
                <label className="form-label">Diagnosis</label>
                <input 
                  className="form-control" 
                  placeholder="Clinical diagnosis..."
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Consultation Notes</label>
                <textarea 
                  className="form-control" 
                  placeholder="Enter detailed observations..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Prescriptions</label>
                  <button type="button" className="btn" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={addMed}>
                    <Plus size={14} /> Add Medication
                  </button>
                </div>
                
                {meds.map((med, index) => (
                  <div key={index} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ flex: 2 }}>
                      <input 
                        className="form-control" 
                        placeholder="Medication name"
                        value={med.medication}
                        onChange={(e) => updateMed(index, 'medication', e.target.value)}
                        required
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <input 
                        className="form-control" 
                        placeholder="Dosage"
                        value={med.dosage}
                        onChange={(e) => updateMed(index, 'dosage', e.target.value)}
                        required
                      />
                    </div>
                    <button type="button" className="btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '10px' }} onClick={() => removeMed(index)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                
                {meds.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '20px', background: 'var(--bg-secondary)', borderRadius: '12px', color: 'var(--text-muted)', fontSize: '13px', border: '1px dashed var(--card-border)' }}>
                    <Pill size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
                    <div>No medications prescribed</div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Complete & Issue Rx</button>
                <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setShowCompleteModal(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
