import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Pill, Printer, ExternalLink, ShieldCheck, Clock } from 'lucide-react';

interface Prescription {
  id: number;
  medication: string;
  dosage: string;
  status: string;
  created_at: string;
  consultation: {
    appointment: {
      doctor: {
        user: { name: string };
      };
      patient: {
        user: { name: string };
      };
    };
  };
}

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem('user_role') || 'patient';

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const res = await api.get('/api/v1/prescriptions');
      setPrescriptions(res.data || []);
    } catch (err) {
      console.error('Failed to fetch prescriptions', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading prescriptions...</div>;

  return (
    <div className="prescriptions-page">
      <div className="role-banner" style={{ marginBottom: '32px' }}>
        <h1 className="page-title">Digital prescriptions</h1>
        <p className="page-subtitle" style={{ color: 'rgba(255,255,255,0.8)' }}>Advanced pharmaceutical tracking and medical compliance center.</p>
      </div>

      <div className="prescriptions-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {prescriptions.length === 0 ? (
          <div className="glass-panel" style={{ padding: '80px', textAlign: 'center', background: 'var(--bg-secondary)', border: '1px dashed var(--card-border)' }}>
            <div className="pulse-primary" style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
              <Pill size={32} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 800 }}>No active prescriptions</h3>
            <p style={{ color: 'var(--text-dim)', maxWidth: '300px', margin: '12px auto' }}>
              {role === 'doctor' ? 'You have not issued any prescriptions yet. Your clinical records will appear here.' : 'Your clinical history is empty. Consult with a specialist to receive digital prescriptions.'}
            </p>
          </div>
        ) : (
          prescriptions.map(presc => (
            <div key={presc.id} className="glass-panel action-card" style={{ padding: '32px', position: 'relative', overflow: 'hidden', cursor: 'default' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                  <div className="icon-wrapper" style={{ width: '64px', height: '64px', flexShrink: 0 }}>
                    <Pill size={28} />
                  </div>
                  <div>
                    <div className="badge badge-primary" style={{ marginBottom: '8px', fontSize: '10px' }}>RX #{presc.id.toString().padStart(6, '0')}</div>
                    <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>{presc.medication}</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '15px', fontWeight: 500 }}>{presc.dosage}</p>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-dim)' }}>
                         <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} />
                         {role === 'doctor' ? `Patient: ${presc.consultation.appointment.patient.user.name}` : `Dr. ${presc.consultation.appointment.doctor.user.name}`}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-dim)' }}>
                         <Clock size={14} /> Issued: {new Date(presc.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px' }}>
                  <div className={`badge badge-${presc.status === 'Issued' ? 'success' : 'primary'}`} style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {presc.status === 'Issued' ? <ShieldCheck size={14} style={{ marginRight: '6px' }} /> : <Clock size={14} style={{ marginRight: '6px' }} />}
                    {presc.status}
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="theme-toggle" title="Print Prescription" style={{ padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--card-border)', borderRadius: '12px' }}>
                       <Printer size={18} />
                    </button>
                    <button className="btn btn-primary" title="View Pharmacy Access" style={{ borderRadius: '12px', padding: '10px 20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Pharmacy Access <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
