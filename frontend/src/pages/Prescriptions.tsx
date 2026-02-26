import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Pill, Printer, ExternalLink, ShieldCheck, Clock } from 'lucide-react';

interface Prescription {
  ID: number;
  Medication: string;
  Dosage: string;
  Status: string;
  CreatedAt: string;
  Consultation: {
    Appointment: {
      Doctor: {
        User: { Name: string };
      };
    };
  };
}

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Digital Prescriptions</h1>
        <p className="page-subtitle">Your medical prescriptions and pharmaceutical history</p>
      </div>

      <div className="prescriptions-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {prescriptions.length === 0 ? (
          <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
            <Pill size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
            <h3>No Active Prescriptions</h3>
            <p style={{ color: 'var(--text-muted)' }}>You don't have any prescriptions issued yet.</p>
          </div>
        ) : (
          prescriptions.map(presc => (
            <div key={presc.ID} className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '16px', 
                    background: 'var(--bg-secondary)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: '1px solid var(--card-border)'
                  }}>
                    <Pill size={32} color="var(--primary)" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '20px', marginBottom: '4px' }}>{presc.Medication}</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>{presc.Dosage}</p>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                        Dr. {presc.Consultation.Appointment.Doctor.User.Name}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                        <Clock size={14} /> Issued: {new Date(presc.CreatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    padding: '6px 16px', 
                    borderRadius: '30px', 
                    background: presc.Status === 'Issued' ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-secondary)',
                    color: presc.Status === 'Issued' ? 'var(--success)' : 'var(--text-muted)',
                    fontSize: '12px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '16px'
                  }}>
                    {presc.Status === 'Issued' && <ShieldCheck size={14} />} {presc.Status}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button className="btn" title="Print Prescription" style={{ padding: '8px' }}><Printer size={18} /></button>
                    <button className="btn btn-primary" title="View Pharmacy Access" style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      Pharmacy Link <ExternalLink size={14} />
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
