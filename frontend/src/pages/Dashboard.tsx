import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Activity, Users, CalendarDays, ClipboardList, Clock, CheckCircle, Calendar as CalendarIcon, ChevronLeft, ChevronRight, User, X, ArrowRight } from 'lucide-react';
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
  const [stats, setStats] = useState<DashboardStats>({
    patients: 0,
    appointments: 0,
    prescriptions: 0,
  });
  const [recentAppts, setRecentAppts] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role] = useState(localStorage.getItem('user_role') || 'patient');

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

  // Sync URL when filter changes
  useEffect(() => {
    if (selectedDateFilter) {
      const dateStr = `${selectedDateFilter.year}-${String(selectedDateFilter.month + 1).padStart(2, '0')}-${String(selectedDateFilter.day).padStart(2, '0')}`;
      setSearchParams({ date: dateStr }, { replace: true });
    } else {
      searchParams.delete('date');
      setSearchParams(searchParams, { replace: true });
    }
  }, [selectedDateFilter, setSearchParams]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [appts, patients, prescs] = await Promise.all([
          api.get('/api/v1/appointments').catch(() => ({ data: [] })),
          api.get('/api/v1/patients').catch(() => ({ data: [] })),
          api.get('/api/v1/prescriptions').catch(() => ({ data: [] }))
        ]);
        
        setStats({
          patients: patients.data?.length || 0,
          appointments: appts.data?.length || 0,
          prescriptions: prescs.data?.length || 0
        });
        setRecentAppts(appts.data || []);
      } catch (err: any) {
        if (err.response?.status === 403) {
           setError("Access Limited: Some modules are hidden based on your role.");
        } else {
           setError("Failed to fetch dashboard data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getRoleTitle = () => {
    switch(role) {
      case 'admin': return 'Health Command Center';
      case 'doctor': return 'Clinical Overview';
      default: return 'My Health Journey';
    }
  };

  // Calendar Logic
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handleDayClick = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Set operations filter
    setSelectedDateFilter({ day, month, year });

    const appts = recentAppts.filter(a => {
      const apptDate = new Date(a.AppointmentDate);
      return apptDate.getFullYear() === year && apptDate.getMonth() === month && apptDate.getDate() === day;
    });
    
    if (appts.length > 0) {
      setSelectedDayAppts({ day, appts });
    }
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Header
    weekdays.forEach(d => days.push(<div key={`h-${d}`} className="calendar-day-header">{d}</div>));

    // Empty cells for first week
    for (let i = 0; i < firstDay; i++) {
       const prevMonthDays = getDaysInMonth(year, month - 1);
       days.push(<div key={`e-${i}`} className="calendar-day different-month">{prevMonthDays - firstDay + i + 1}</div>);
    }

    // Actual days
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();
      const isSelected = selectedDateFilter?.day === d && selectedDateFilter?.month === month && selectedDateFilter?.year === year;
      const hasAppt = recentAppts.some(a => {
        const apptDate = new Date(a.AppointmentDate);
        return apptDate.getFullYear() === year && apptDate.getMonth() === month && apptDate.getDate() === d;
      });

      days.push(
        <div 
          key={d} 
          onClick={() => handleDayClick(d)}
          className={`calendar-day ${isToday ? 'today' : ''} ${hasAppt ? 'has-appt' : ''} ${isSelected ? 'selected' : ''}`}
        >
          {d}
        </div>
      );
    }

    return days;
  };

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const filteredOperations = selectedDateFilter 
    ? recentAppts.filter(a => {
        const d = new Date(a.AppointmentDate);
        return d.getDate() === selectedDateFilter.day && 
               d.getMonth() === selectedDateFilter.month && 
               d.getFullYear() === selectedDateFilter.year;
      })
    : recentAppts.slice(0, 6);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', animation: 'fadeIn 0.5s ease', position: 'relative' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
           <h1 className="page-title">{getRoleTitle()}</h1>
           <p className="page-subtitle">Real-time monitoring of medical operations and schedules.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
           <div style={{ padding: '6px 12px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--card-border)', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} /> System Online
           </div>
        </div>
      </div>

      {error && (
        <div className="glass-panel" style={{ padding: '16px 24px', borderLeft: '4px solid var(--primary)', marginBottom: '32px', color: 'var(--text-main)', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <div className="stats-grid">
        {(role === 'admin' || role === 'doctor') && (
          <div className="stat-card glass-panel" style={{ borderTop: '2px solid var(--primary)' }}>
            <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}>
              <Users size={24} />
            </div>
            <div>
              <div className="stat-label">Total Patients</div>
              <div className="stat-value">{stats.patients}</div>
            </div>
          </div>
        )}

        <div className="stat-card glass-panel" style={{ borderTop: '2px solid var(--success)' }}>
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            <CalendarDays size={24} />
          </div>
          <div>
            <div className="stat-label">{role === 'patient' ? 'My Visits' : 'Active Appointments'}</div>
            <div className="stat-value">{stats.appointments}</div>
          </div>
        </div>

        <div className="stat-card glass-panel" style={{ borderTop: '2px solid var(--warning)' }}>
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
            <ClipboardList size={24} />
          </div>
          <div>
            <div className="stat-label">{role === 'patient' ? 'Active Rx' : 'Issued Rxs'}</div>
            <div className="stat-value">{stats.prescriptions}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '32px', alignItems: 'stretch' }}>
        {/* Calendar Section */}
        <div className="glass-panel" style={{ padding: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
             <div>
                <h2 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '6px' }}>Schedule</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Timeline of upcoming medical events</p>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-secondary)', padding: '6px 6px 6px 16px', borderRadius: '14px', border: '1px solid var(--card-border)' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, textTransform: 'capitalize', color: 'var(--text-main)', minWidth: '110px', textAlign: 'center' }}>
                  {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <div style={{ display: 'flex', gap: '2px', marginLeft: '12px' }}>
                   <button className="theme-toggle" style={{ padding: '8px', border: 'none', background: 'transparent' }} onClick={() => changeMonth(-1)}><ChevronLeft size={18} /></button>
                   <button className="theme-toggle" style={{ padding: '8px', border: 'none', background: 'transparent' }} onClick={() => changeMonth(1)}><ChevronRight size={18} /></button>
                </div>
             </div>
          </div>
          
          <div className="calendar-container">
            {renderCalendar()}
          </div>

          <div style={{ marginTop: '40px', display: 'flex', gap: '24px', padding: '20px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--primary)' }} />
                Today's Date
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '3px', border: '2px solid var(--primary)' }} />
                Has Appointment
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '3px', border: '2px solid white', background: 'rgba(59, 130, 246, 0.2)' }} />
                Selected Filter
             </div>
          </div>
        </div>

        {/* Activity Section */}
        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '12px' }}>
                 <Activity size={22} color="var(--primary)" /> 
                 Operations
              </h2>
              {selectedDateFilter && (
                <button 
                  onClick={() => setSelectedDateFilter(null)}
                  style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <X size={14} /> Clear Filter
                </button>
              )}
           </div>

           {loading ? (
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                   <Clock className="brand-icon" size={40} style={{ animation: 'pulse 2s infinite' }} />
               </div>
           ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                  {filteredOperations.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-secondary)', borderRadius: '20px', border: '1px dashed var(--card-border)' }}>
                       <CalendarIcon size={40} style={{ marginBottom: '16px', opacity: 0.3 }} />
                       <p>{selectedDateFilter ? `No events on ${selectedDateFilter.day}/${selectedDateFilter.month + 1}` : 'No recent activity logs.'}</p>
                    </div>
                  ) : (
                    filteredOperations.map(appt => (
                      <div key={appt.ID} className="activity-item" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '18px', border: '1px solid var(--card-border)', transition: 'all 0.3s' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: appt.Status === 'Completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                          {appt.Status === 'Completed' ? <CheckCircle size={24} color="var(--success)" /> : <User size={24} color="var(--primary)" />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-main)' }}>
                            {role === 'admin' ? (
                              <span style={{ fontSize: '13px' }}>P: {appt.Patient.User.Name} | D: {appt.Doctor.User.Name}</span>
                            ) : (
                              role === 'patient' ? `Dr. ${appt.Doctor.User.Name}` : appt.Patient.User.Name
                            )}
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {appt.Status === 'Completed' ? 'Consultation Finished' : 'Scheduled Visit'}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                           <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
                             {new Date(appt.AppointmentDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                           </div>
                           <div className={`status-badge ${appt.Status.toLowerCase()}`} style={{ fontSize: '10px', padding: '4px 8px', marginTop: '6px' }}>{appt.Status}</div>
                        </div>
                      </div>
                    ))
                  )}
              </div>
           )}
        </div>
      </div>

      {/* Day Detail Modal - Deep Dive */}
      {selectedDayAppts && (
        <div className="modal-overlay" onClick={() => setSelectedDayAppts(null)}>
          <div className="modal-content glass-panel" style={{ maxWidth: '600px', padding: '0', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '32px', background: 'var(--primary)', color: 'white' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>{selectedDayAppts.day} {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                    <p style={{ opacity: 0.8, fontSize: '14px' }}>Daily Consultant Schedule</p>
                  </div>
                  <button onClick={() => setSelectedDayAppts(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', padding: '8px', borderRadius: '10px', color: 'white', cursor: 'pointer' }}>
                    <X size={20} />
                  </button>
               </div>
            </div>
            
            <div style={{ padding: '32px' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {selectedDayAppts.appts.map(appt => (
                    <div key={appt.ID} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                       <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                          <Clock size={24} color="var(--primary)" />
                       </div>
                       <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                             {new Date(appt.AppointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
                             {role === 'admin' ? (
                               <div style={{ fontSize: '14px' }}>P: {appt.Patient.User.Name} | D: {appt.Doctor.User.Name}</div>
                             ) : (
                               role === 'patient' ? `Dr. ${appt.Doctor.User.Name}` : appt.Patient.User.Name
                             )}
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                             {role === 'admin' ? appt.Doctor.Department.Name : (role === 'patient' ? appt.Doctor.User.Name : 'General Consultation')}
                          </div>
                       </div>
                       <button className="theme-toggle" style={{ padding: '10px', background: 'var(--primary)', color: 'white', borderRadius: '10px' }}>
                          <ArrowRight size={18} />
                       </button>
                    </div>
                  ))}
               </div>
               
               <div style={{ marginTop: '32px', textAlign: 'center' }}>
                  <button onClick={() => setSelectedDayAppts(null)} className="btn btn-primary" style={{ width: '100%' }}>Close Schedule</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
