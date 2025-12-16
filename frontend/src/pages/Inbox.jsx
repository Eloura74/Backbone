import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, AlertCircle, FileText, Phone, Mail, MessageSquare, Plus, X, ArrowRight } from 'lucide-react';
import api from '../api/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Inbox = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Forms State
  const [newItem, setNewItem] = useState({ source: 'note', type: 'info', content: '' });
  const [processData, setProcessData] = useState({ decision: '', context: '', responsible: '' });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await api.get('/inbox/', { params: { status: 'pending' } });
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching inbox items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inbox/', newItem);
      setIsAddModalOpen(false);
      setNewItem({ source: 'note', type: 'info', content: '' });
      fetchItems();
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const openProcessModal = (item) => {
    setSelectedItem(item);
    setProcessData({ decision: '', context: '', responsible: '' });
    setIsProcessModalOpen(true);
  };

  const handleProcessItem = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      await api.post(`/inbox/${selectedItem.id}/process`, processData);
      setIsProcessModalOpen(false);
      fetchItems();
    } catch (error) {
      console.error('Error processing item:', error);
    }
  };

  const getIcon = (source) => {
    switch (source) {
      case 'email': return <Mail size={18} />;
      case 'call': return <Phone size={18} />;
      case 'note': return <FileText size={18} />;
      default: return <MessageSquare size={18} />;
    }
  };

  const getStatusBadge = (type) => {
    switch (type) {
      case 'rh': return <span className="badge badge-rh">RH</span>;
      case 'urgence': return <span className="badge badge-urgence">URGENCE</span>;
      default: return <span className="badge badge-info">{type.toUpperCase()}</span>;
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Inbox Unifiée</h1>
          <p className="text-muted">Centralisation des flux entrants</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} style={{ marginRight: '0.5rem' }} />
          Nouvelle Entrée
        </button>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {items.map((item) => (
            <div key={item.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', animation: 'fadeIn 0.5s ease-out' }}>
              <div style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '50%' }}>
                {getIcon(item.source)}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  {getStatusBadge(item.type)}
                  <span className="text-xs text-muted">
                    {format(new Date(item.created_at), 'dd MMM HH:mm', { locale: fr })}
                  </span>
                </div>
                <div style={{ fontWeight: 500, fontSize: '1.05rem' }}>{item.content}</div>
              </div>

              <div>
                <button className="btn" onClick={() => openProcessModal(item)} title="Traiter">
                  <CheckCircle size={18} style={{ color: 'var(--accent-success)' }} />
                  <span style={{ marginLeft: '0.5rem' }}>Traiter</span>
                </button>
              </div>
            </div>
          ))}
          
          {items.length === 0 && (
            <div className="text-muted" style={{ textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-lg)' }}>
              <CheckCircle size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
              <p>Aucune entrée en attente. Tout est calme.</p>
            </div>
          )}
        </div>
      )}

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsAddModalOpen(false)}>
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3>Nouvelle Entrée</h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddItem}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Source</label>
                <select className="input" value={newItem.source} onChange={(e) => setNewItem({...newItem, source: e.target.value})}>
                  <option value="note">Note Rapide</option>
                  <option value="email">Email</option>
                  <option value="call">Appel</option>
                  <option value="internal">Interne</option>
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Type</label>
                <select className="input" value={newItem.type} onChange={(e) => setNewItem({...newItem, type: e.target.value})}>
                  <option value="info">Information</option>
                  <option value="rh">Ressources Humaines</option>
                  <option value="logement">Logement</option>
                  <option value="facturation">Facturation</option>
                  <option value="direction">Direction</option>
                  <option value="urgence">URGENCE</option>
                </select>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Contenu</label>
                <textarea 
                  className="input" 
                  rows="3" 
                  value={newItem.content} 
                  onChange={(e) => setNewItem({...newItem, content: e.target.value})}
                  placeholder="Description de la demande..."
                  required
                ></textarea>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn" onClick={() => setIsAddModalOpen(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Process Modal */}
      {isProcessModalOpen && selectedItem && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsProcessModalOpen(false)}>
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3>Traiter la demande</h3>
              <button onClick={() => setIsProcessModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{selectedItem.content}</p>
            </div>

            <form onSubmit={handleProcessItem}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Décision / Action</label>
                <textarea 
                  className="input" 
                  rows="3" 
                  value={processData.decision} 
                  onChange={(e) => setProcessData({...processData, decision: e.target.value})}
                  placeholder="Quelle action a été prise ?"
                  required
                ></textarea>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Contexte supplémentaire (Optionnel)</label>
                <input 
                  type="text" 
                  className="input" 
                  value={processData.context} 
                  onChange={(e) => setProcessData({...processData, context: e.target.value})}
                  placeholder="Détails utiles pour la mémoire..."
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Responsable (Optionnel)</label>
                <input 
                  type="text" 
                  className="input" 
                  value={processData.responsible} 
                  onChange={(e) => setProcessData({...processData, responsible: e.target.value})}
                  placeholder="Qui gère ce dossier ?"
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn" onClick={() => setIsProcessModalOpen(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">
                  <CheckCircle size={18} style={{ marginRight: '0.5rem' }} />
                  Valider & Archiver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inbox;
