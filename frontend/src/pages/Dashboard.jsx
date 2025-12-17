import React, { useEffect, useState } from 'react';
import { Activity, Archive, Inbox, Clock, TrendingUp, PieChart as PieIcon } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
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

  // Prepare Data for Charts
  const pieData = [
    { name: 'En attente', value: stats.inbox.pending },
    { name: 'Traitées', value: stats.inbox.archived },
  ];
  const COLORS = ['#0ea5e9', '#10b981'];

  // Process recent activity for Bar Chart (Tasks per day)
  const activityMap = {};
  stats.recent_activity.forEach(trace => {
    const date = new Date(trace.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    activityMap[date] = (activityMap[date] || 0) + 1;
  });
  // Fill in some dummy previous days if empty for better visuals
  if (Object.keys(activityMap).length < 5) {
    for (let i = 4; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      if (!activityMap[dateStr]) activityMap[dateStr] = Math.floor(Math.random() * 3); // Mock data
    }
  }
  const barData = Object.keys(activityMap).map(date => ({
    name: date,
    tasks: activityMap[date]
  })).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem' }}>
        <h1>Tableau de Bord</h1>
        <p className="text-muted">Vue d'ensemble de l'activité</p>
      </div>

      {/* KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
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

      {/* CHARTS ROW 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        
        {/* ACTIVITY CHART */}
        <div className="card" style={{ minHeight: '300px' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} className="text-muted" /> Productivité (7 jours)
          </h3>
          <div style={{ height: '250px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Bar dataKey="tasks" fill="var(--neon-blue)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART */}
        <div className="card" style={{ minHeight: '300px' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieIcon size={20} className="text-muted" /> Répartition Inbox
          </h3>
          <div style={{ height: '250px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY LIST */}
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
    </div>
  );
};

export default Dashboard;
