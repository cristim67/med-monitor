import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Activity, Users, CalendarDays, ClipboardList, 
  ChevronLeft, 
  ChevronRight, User, X, ArrowRight, ShieldCheck, 
  Stethoscope, HeartPulse, LineChart, PlusCircle, 
  Bell, Database, Settings, Clock
} from 'lucide-react';
import api from '../api/axios';

interface DashboardStats {
  patients: number;
  appointments: number;
  prescriptions: number;
}

interface Appointment {
  ID: number;
  AppointmentDate: string;
  Status: string;
  Doctor: { 
    User: { Name: string };
    Department: { Name: string };
  };
  Patient: { User: { Name: string } };
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({ patients: 0, appointments: 0, prescriptions: 0 });
  const [recentAppts, setRecentAppts] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role] = useState(localStorage.getItem('user_role') || 'patient');
  const user_name = localStorage.getItem('user_name') || 'Guest';

  const [searchParams, setSearchParams] = useSearchParams();

  // Calendar State
  const [currentDate, setCurrentDate] = useState(() => {
    const dateParam = searchParams.get('date');
    const d = dateParam ? new Date(dateParam) : new Date();
    return isNaN(d.getTime()) ? new Date() : d;
  });

  const [selectedDayAppts, setSelectedDayAppts] = useState<{ day: number, appts: Appointment[] } | null>(null);
  const [selectedDateFilter, setSelectedDateFilter] = useState<{ day: number, month: number, year: number } | null>(() => {
    const dateParam = searchParams.get('date');
    const today = new Date();
    const d = dateParam ? new Date(dateParam) : today;
    const finalD = isNaN(d.getTime()) ? today : d;
    return { day: finalD.getDate(), month: finalD.getMonth(), year: finalD.getFullYear() };
  });

  useEffect(() => {
    if (selectedDateFilter) {
      const dateStr = `${selectedDateFilter.year}-${String(selectedDateFilter.month + 1).padStart(2, '0')}-${String(selectedDateFilter.day).padStart(2, '0')}`;
      setSearchParams({ date: dateStr }, { replace: true });
    }
  }, [selectedDateFilter, setSearchParams]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const fetchPatients = (role === 'admin' || role === 'doctor') 
          ? api.get('/api/v1/patients').catch(() => ({ data: [] }))
          : Promise.resolve({ data: [] });

        const [appts, patients, prescs] = await Promise.all([
          api.get('/api/v1/appointments').catch(() => ({ data: [] })),
          fetchPatients,
          api.get('/api/v1/prescriptions').catch(() => ({ data: [] }))
        ]);
        
        setStats({
          patients: patients.data?.length || 0,
          appointments: appts.data?.length || 0,
          prescriptions: prescs.data?.length || 0
        });
        setRecentAppts(appts.data || []);
      } catch (err: any) {
        setError(err.response?.status === 403 ? "Access Restricted" : "Failed to sync dashboard.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handleDayClick = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    setSelectedDateFilter({ day, month, year });

    const appts = recentAppts.filter(a => {
      const d = new Date(a.AppointmentDate);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
    if (appts.length > 0) setSelectedDayAppts({ day, appts });
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    // Empty cells
    for (let i = 1; i <= firstDay; i++) {
        days.push(<div key={`e-${i}`} className="calendar-day other-month"></div>);
    }

    // Days
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();
      const hasAppt = recentAppts.some(a => {
        const date = new Date(a.AppointmentDate);
        return date.getFullYear() === year && date.getMonth() === month && date.getDate() === d;
      });
      const isSelected = selectedDateFilter?.day === d && selectedDateFilter?.month === month && selectedDateFilter?.year === year;

      days.push(
        <div 
          key={d} 
          onClick={() => handleDayClick(d)}
          className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'active' : ''}`}
        >
          {d}
          {hasAppt && <div className="calendar-event-dot" />}
        </div>
      );
    }
    return days;
  };

  const filteredOps = selectedDateFilter 
    ? recentAppts.filter((a: Appointment) => {
        const d = new Date(a.AppointmentDate);
        return d.getDate() === selectedDateFilter.day && d.getMonth() === selectedDateFilter.month;
      })
    : recentAppts.slice(0, 6);

  if (loading) return (
    <div style={{ display: 'flex', height: '80vh', alignItems: 'center', justifyContent: 'center' }}>
      <div className="pulse-primary" style={{ width: 'calc(40 / 16 * 1rem)', height: 'calc(40 / 16 * 1rem)', borderRadius: '50%', background: 'var(--primary)' }} />
    </div>
  );

  return (
    <div style={{ maxWidth: 'calc(1400 / 16 * 1rem)', margin: '0 auto', paddingBottom: 'calc(60 / 16 * 1rem)' }}>
      {error && (
        <div className="glass-panel" style={{ padding: 'calc(16 / 16 * 1rem)', borderLeft: '4px solid var(--primary)', marginBottom: 'calc(24 / 16 * 1rem)', color: 'var(--text-main)', fontSize: 'calc(14 / 16 * 1rem)' }}>
          {error}
        </div>
      )}
      
      {/* Banner */}
      <div className="role-banner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="badge badge-primary" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', marginBottom: 'calc(16 / 16 * 1rem)' }}>
              {role.toUpperCase()} SESSION ACTIVE
            </div>
            <h1>{role === 'admin' ? 'Health System Overview' : role === 'doctor' ? `Welcome back, Dr. ${user_name.split(' ')[0]}` : `Hello, ${user_name.split(' ')[0]}`}</h1>
            <p>{role === 'admin' ? 'Monitor clinic health and manage infrastructure.' : role === 'doctor' ? 'Review patients and manage your daily clinical tasks.' : 'Manage your upcoming consultations and prescriptions.'}</p>
          </div>
          <div className="pulse-primary" style={{ width: 'calc(80 / 16 * 1rem)', height: 'calc(80 / 16 * 1rem)', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
            {role === 'admin' ? <ShieldCheck size={40} /> : role === 'doctor' ? <Stethoscope size={40} /> : <HeartPulse size={40} />}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="badge badge-primary">ACTIVE MONITORING</span>
            <div className="stat-icon-box" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}><Activity size={20} /></div>
          </div>
          <div className="stat-content">
            <h4>{stats.appointments}</h4>
            <span>{role === 'patient' ? 'Total Visits' : 'Pending Appts'}</span>
          </div>
        </div>

        {(role === 'admin' || role === 'doctor') && (
          <div className="stat-card">
            <div className="stat-header">
              <span className="badge badge-success">MANAGEMENT</span>
              <div className="stat-icon-box" style={{ background: 'hsla(150, 70%, 50%, 0.1)', color: 'var(--success)' }}><Users size={20} /></div>
            </div>
            <div className="stat-content">
              <h4>{stats.patients}</h4>
              <span>Managed Patients</span>
            </div>
          </div>
        )}

        <div className="stat-card">
          <div className="stat-header">
            <span className="badge badge-warning">RECORDS</span>
            <div className="stat-icon-box" style={{ background: 'hsla(40, 90%, 60%, 0.1)', color: 'var(--warning)' }}><ClipboardList size={20} /></div>
          </div>
          <div className="stat-content">
            <h4>{stats.prescriptions}</h4>
            <span>{role === 'patient' ? 'My Prescriptions' : 'Issued Rx Packages'}</span>
          </div>
        </div>
      </div>

      {/* Features/Quick Actions Grid */}
      <div className="feature-grid">
        {role === 'admin' ? (
          <>
            <Link to="/admin/users" className="action-card glass-panel" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="icon-wrapper"><Users size={24} /></div>
              <div>
                <h3>User Management</h3>
                <p>Grant permissions, change roles, and manage all staff/patients.</p>
              </div>
            </Link>
            <div className="action-card glass-panel">
              <div className="icon-wrapper"><Database size={24} /></div>
              <div>
                <h3>System Logs</h3>
                <p>View real-time API transactions and database activity.</p>
              </div>
            </div>
            <div className="action-card glass-panel">
              <div className="icon-wrapper"><Settings size={24} /></div>
              <div>
                <h3>Clinic Config</h3>
                <p>Update departments, services, and facility information.</p>
              </div>
            </div>
          </>
        ) : role === 'doctor' ? (
          <>
            <Link to="/appointments" className="action-card glass-panel" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="icon-wrapper"><CalendarDays size={24} /></div>
              <div>
                <h3>Visit Schedule</h3>
                <p>View and manage all appointments for today and tomorrow.</p>
              </div>
            </Link>
            <Link to="/patients" className="action-card glass-panel" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="icon-wrapper"><LineChart size={24} /></div>
              <div>
                <h3>Clinical Files</h3>
                <p>Review patient histories, diagnoses, and test results.</p>
              </div>
            </Link>
            <div className="action-card glass-panel">
              <div className="icon-wrapper"><Bell size={24} /></div>
              <div>
                <h3>Notifications</h3>
                <p>Emergency alerts and pending consultation requests.</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <Link to="/appointments" className="action-card glass-panel" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="icon-wrapper"><PlusCircle size={24} /></div>
              <div>
                <h3>Book Consult</h3>
                <p>Find a specialist and schedule your next clinical visit.</p>
              </div>
            </Link>
            <Link to="/prescriptions" className="action-card glass-panel" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="icon-wrapper"><ClipboardList size={24} /></div>
              <div>
                <h3>My Prescriptions</h3>
                <p>Active medical prescriptions and dosage instructions.</p>
              </div>
            </Link>
            <div className="action-card glass-panel">
              <div className="icon-wrapper"><Activity size={24} /></div>
              <div>
                <h3>Health Track</h3>
                <p>Monitor vitals, weight, and chronic conditions trends.</p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="dashboard-grid">
        {/* Calendar Card */}
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div className="calendar-header" style={{ padding: '32px 32px 0 32px' }}>
            <div>
              <h2 style={{ fontSize: 'calc(20 / 16 * 1rem)', fontWeight: 800 }}>Medical Timeline</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 'calc(13 / 16 * 1rem)' }}>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
            </div>
            <div style={{ display: 'flex', gap: 'calc(8 / 16 * 1rem)' }}>
              <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="theme-toggle"><ChevronLeft size={16} /></button>
              <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="theme-toggle"><ChevronRight size={16} /></button>
            </div>
          </div>
          <div style={{ padding: 'calc(32 / 16 * 1rem)' }}>
            <div className="calendar-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="calendar-day-label">{d}</div>)}
              {renderCalendar()}
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="glass-panel" style={{ padding: 'calc(32 / 16 * 1rem)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'calc(24 / 16 * 1rem)' }}>
             <h2 style={{ fontSize: 'calc(18 / 16 * 1rem)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 'calc(10 / 16 * 1rem)' }}>
                <Clock size={20} color="var(--primary)" /> Recent Operations
             </h2>
             {selectedDateFilter && <button onClick={() => setSelectedDateFilter(null)} style={{ border: 'none', background: 'transparent', color: 'var(--primary)', fontSize: 'calc(12 / 16 * 1rem)', fontWeight: 700, cursor: 'pointer' }}>Clear</button>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'calc(12 / 16 * 1rem)' }}>
            {filteredOps.length === 0 ? (
              <div style={{ padding: 'calc(40 / 16 * 1rem)', textAlign: 'center', color: 'var(--text-dim)', background: 'var(--bg-secondary)', borderRadius: 'calc(20 / 16 * 1rem)', border: '1px dashed var(--card-border)' }}>
                No events recorded.
              </div>
            ) : (
              filteredOps.map((op: Appointment) => (
                <div key={op.ID} className="data-row" style={{ padding: 'calc(16 / 16 * 1rem)', borderRadius: 'calc(16 / 16 * 1rem)', background: 'var(--bg-secondary)' }}>
                  <div style={{ display: 'flex', gap: 'calc(16 / 16 * 1rem)', alignItems: 'center' }}>
                    <div style={{ width: 'calc(40 / 16 * 1rem)', height: 'calc(40 / 16 * 1rem)', borderRadius: 'calc(10 / 16 * 1rem)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={18} color="var(--text-muted)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 'calc(14 / 16 * 1rem)' }}>{role === 'patient' ? `Dr. ${op.Doctor.User.Name}` : op.Patient.User.Name}</div>
                      <div style={{ fontSize: 'calc(12 / 16 * 1rem)', color: 'var(--text-dim)' }}>{op.Status} - {new Date(op.AppointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                  <div className={`status-badge ${op.Status.toLowerCase()}`}>{op.Status[0]}</div>
                </div>
              ))
            )}
          </div>
          
          <Link to="/appointments" className="btn btn-primary" style={{ marginTop: 'calc(24 / 16 * 1rem)', width: '100%', borderRadius: 'calc(16 / 16 * 1rem)' }}>
            Open Vision Planner <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Modal Detail */}
      {selectedDayAppts && (
        <div className="modal-overlay" onClick={() => setSelectedDayAppts(null)}>
          <div className="modal-content" onClick={(e: any) => e.stopPropagation()}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'calc(32 / 16 * 1rem)' }}>
                <h2 style={{ fontSize: 'calc(24 / 16 * 1rem)', fontWeight: 800 }}>Schedule for Day {selectedDayAppts.day}</h2>
                <button onClick={() => setSelectedDayAppts(null)} className="theme-toggle"><X size={20} /></button>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 'calc(16 / 16 * 1rem)' }}>
                {selectedDayAppts.appts.map((a: Appointment) => (
                  <div key={a.ID} style={{ padding: 'calc(20 / 16 * 1rem)', borderRadius: 'calc(20 / 16 * 1rem)', background: 'var(--bg-secondary)', border: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div>
                        <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: 'calc(12 / 16 * 1rem)', marginBottom: 'calc(4 / 16 * 1rem)' }}>{new Date(a.AppointmentDate).toLocaleTimeString()}</div>
                        <div style={{ fontWeight: 700 }}>{a.Patient.User.Name}</div>
                        <div style={{ fontSize: 'calc(13 / 16 * 1rem)', color: 'var(--text-muted)' }}>Dr. {a.Doctor.User.Name} ({a.Doctor.Department.Name})</div>
                     </div>
                     <div className={`badge badge-${a.Status === 'Completed' ? 'success' : 'primary'}`}>{a.Status}</div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
