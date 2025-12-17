import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Inbox, BrainCircuit, Settings, Command as CommandIcon, Menu, X } from 'lucide-react';
import CommandPalette from './CommandPalette';
import ParticlesBackground from './ParticlesBackground';
import { AnimatePresence } from 'framer-motion';

const Layout = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="layout">
      <ParticlesBackground />
      <CommandPalette />
      
      {/* Mobile Toggle Button */}
      <button 
        className="mobile-toggle btn" 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        style={{ 
          position: 'fixed', 
          top: '1rem', 
          right: '1rem', 
          zIndex: 200, 
          padding: '0.5rem',
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 140
          }}
        />
      )}
      
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div style={{ marginBottom: '2rem', paddingLeft: '1rem' }}>
          <h1 style={{ fontSize: '2rem', letterSpacing: '-0.05em' }}>BACKBONE</h1>
          <p className="text-xs text-muted" style={{ marginTop: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Neural Interface v2.0</p>
        </div>

        {/* Gamification Widget */}
        <div style={{ margin: '0 1rem 2rem 1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#a78bfa' }}>NIVEAU 3</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ARCHITECTE</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: '75%', height: '100%', background: 'linear-gradient(90deg, #a78bfa, #8b5cf6)' }}></div>
          </div>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'right' }}>2,450 / 3,000 XP</p>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <NavLink 
            to="/" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Inbox size={20} />
            <span>Inbox Unifiée</span>
          </NavLink>
          
          <NavLink 
            to="/memory" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <BrainCircuit size={20} />
            <span>Mémoire Active</span>
          </NavLink>

          <div style={{ margin: '2rem 1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}></div>

          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <LayoutDashboard size={20} />
            <span>Tableau de Bord</span>
          </NavLink>
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 'bold' }}>CTRL+K</div>
            <span className="text-xs text-muted">Commandes</span>
          </div>

          <NavLink 
            to="/settings" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Settings size={20} />
            <span>Configuration</span>
          </NavLink>
        </div>
      </aside>

      <main className="main-content">
        <AnimatePresence mode="wait">
          <Outlet key={location.pathname} />
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Layout;
