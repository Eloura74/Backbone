import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { Inbox, BrainCircuit, LayoutDashboard, Settings, Plus, Search } from 'lucide-react';

const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command) => {
    setOpen(false);
    command();
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={() => setOpen(false)}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '640px' }}>
        <Command label="Command Menu">
          <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '0 1rem' }}>
            <Search size={20} className="text-muted" />
            <Command.Input placeholder="Que voulez-vous faire ?" />
          </div>
          
          <Command.List style={{ maxHeight: '300px', overflowY: 'auto', padding: '0.5rem' }}>
            <Command.Empty style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Aucun résultat.</Command.Empty>

            <Command.Group heading="Navigation" style={{ marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, paddingLeft: '0.5rem' }}>
              <Command.Item onSelect={() => runCommand(() => navigate('/'))}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Inbox size={16} />
                  <span>Inbox</span>
                </div>
              </Command.Item>
              <Command.Item onSelect={() => runCommand(() => navigate('/memory'))}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BrainCircuit size={16} />
                  <span>Mémoire</span>
                </div>
              </Command.Item>
              <Command.Item onSelect={() => runCommand(() => navigate('/dashboard'))}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <LayoutDashboard size={16} />
                  <span>Tableau de Bord</span>
                </div>
              </Command.Item>
              <Command.Item onSelect={() => runCommand(() => navigate('/settings'))}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Settings size={16} />
                  <span>Configuration</span>
                </div>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Actions" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, paddingLeft: '0.5rem' }}>
              <Command.Item onSelect={() => runCommand(() => { navigate('/'); setTimeout(() => document.querySelector('.btn-primary')?.click(), 100); })}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Plus size={16} />
                  <span>Nouvelle Entrée</span>
                </div>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
};

export default CommandPalette;
