import React, { useEffect, useState } from 'react';
import { BarChart, Activity, Archive, Inbox, Clock } from 'lucide-react';
import api from '../api/client';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container"><p>Chargement des indicateurs...</p></div>;

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem' }}>
        <h1>Tableau de Bord</h1>
        <p className="text-muted">Vue d'ensemble de l'activité</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {/* Stat Cards */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--accent-primary)' }}>
            <Inbox size={24} />
          </div>
          <div>
            <div className="text-sm text-muted">En attente</div>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.inbox.pending}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--accent-success)' }}>
            <Archive size={24} />
          </div>
          <div>
            <div className="text-sm text-muted">Traitées</div>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.inbox.archived}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--accent-secondary)' }}>
            <Activity size={24} />
          </div>
          <div>
            <div className="text-sm text-muted">Mémoire Totale</div>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.memory.total}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} className="text-muted" /> Activité Récente
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {stats.recent_activity.map((trace) => (
              <div key={trace.id} style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>{trace.decision}</div>
                  <div className="text-xs text-muted" style={{ maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {trace.context}
                  </div>
                </div>
                <div className="text-xs text-muted">
                  {new Date(trace.date).toLocaleDateString()}
                </div>
              </div>
            ))}
            {stats.recent_activity.length === 0 && <p className="text-muted">Aucune activité récente.</p>}
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ marginBottom: '1rem', color: 'var(--accent-warning)' }}>
            <BarChart size={48} />
          </div>
          <h3>Performance</h3>
          <p className="text-muted text-sm" style={{ marginTop: '0.5rem' }}>
            Les graphiques détaillés seront disponibles dans la version Pro.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
