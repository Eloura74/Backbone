import React, { useEffect, useState } from 'react';
import { History, Search } from 'lucide-react';
import api from '../api/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Memory = () => {
  const [traces, setTraces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTraces();
  }, []);

  const fetchTraces = async () => {
    try {
      const response = await api.get('/memory/');
      setTraces(response.data);
    } catch (error) {
      console.error('Error fetching memory traces:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Mémoire Active</h1>
          <p className="text-muted">Historique des décisions et actions</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={20} className="text-muted" />
          <input 
            type="text" 
            placeholder="Rechercher dans la mémoire..." 
            className="input"
            style={{ border: 'none', background: 'transparent', padding: 0 }}
          />
        </div>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {traces.map((trace) => (
            <div key={trace.id} className="card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="text-sm text-accent" style={{ fontWeight: 600 }}>{trace.context}</span>
                <span className="text-xs text-muted">
                  {format(new Date(trace.date), 'dd MMM yyyy HH:mm', { locale: fr })}
                </span>
              </div>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{trace.decision}</p>
              {trace.responsible && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Responsable: {trace.responsible}
                </div>
              )}
            </div>
          ))}

          {traces.length === 0 && (
            <div className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>
              La mémoire est vide.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Memory;
