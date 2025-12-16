import React from 'react';
import { Save, Trash2, Download, User, Bell, Shield } from 'lucide-react';

const Settings = () => {
  return (
    <div className="container">
      <div style={{ marginBottom: '2rem' }}>
        <h1>Configuration</h1>
        <p className="text-muted">Paramètres de l'application</p>
      </div>

      <div style={{ maxWidth: '800px' }}>
        {/* Section Apparence */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Apparence & Interface
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontWeight: 500 }}>Thème Sombre</div>
              <div className="text-xs text-muted">Activer le mode nuit (Défaut)</div>
            </div>
            <div className="badge badge-info">ACTIF</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 500 }}>Animations Fluides</div>
              <div className="text-xs text-muted">Réduire pour plus de performance</div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '20px' }}>
              <input type="checkbox" checked readOnly style={{ opacity: 0, width: 0, height: 0 }} />
              <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--accent-primary)', borderRadius: '20px', transition: '.4s' }}></span>
              <span style={{ position: 'absolute', content: '""', height: '16px', width: '16px', left: '22px', bottom: '2px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%' }}></span>
            </label>
          </div>
        </div>

        {/* Section Données */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Gestion des Données
          </h3>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn" style={{ flex: 1 }}>
              <Download size={18} style={{ marginRight: '0.5rem' }} />
              Exporter la Mémoire (CSV)
            </button>
            <button className="btn" style={{ flex: 1, borderColor: 'var(--accent-danger)', color: 'var(--accent-danger)', background: 'rgba(239, 68, 68, 0.05)' }}>
              <Trash2 size={18} style={{ marginRight: '0.5rem' }} />
              Réinitialiser tout
            </button>
          </div>
        </div>

        {/* Section A Propos */}
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <h4 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>BACKBONE v1.0</h4>
          <p className="text-sm text-muted">Système Nerveux Administratif Intelligent</p>
          <p className="text-xs text-muted" style={{ marginTop: '1rem' }}>Développé avec ❤️ pour simplifier votre quotidien.</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
