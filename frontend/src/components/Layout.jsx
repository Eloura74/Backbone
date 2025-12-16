import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Inbox, BrainCircuit, Settings } from 'lucide-react';

const Layout = () => {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div style={{ marginBottom: '3rem', paddingLeft: '1rem' }}>
          <h1>BACKBONE</h1>
          <p className="text-sm text-muted" style={{ marginTop: '0.5rem' }}>Système Nerveux Admin</p>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Inbox size={20} />
            <span>Inbox Unifiée</span>
          </NavLink>
          
          <NavLink to="/memory" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <BrainCircuit size={20} />
            <span>Mémoire Active</span>
          </NavLink>

          <div style={{ margin: '1.5rem 0', borderTop: '1px solid var(--border-color)' }}></div>

          <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Tableau de Bord</span>
          </NavLink>
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Settings size={20} />
            <span>Configuration</span>
          </NavLink>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
