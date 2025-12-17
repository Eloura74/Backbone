import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Search, Grid, Network, Filter, Trash2, X } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import MemoryGraph from '../components/MemoryGraph';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Memory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // Default to list for better readability of details
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ decision: '', context: '', responsible: '' });

  useEffect(() => {
    fetchMemory();
  }, []);

  const fetchMemory = async () => {
    try {
      const response = await api.get('/memory/'); 
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching memory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (confirm('Oublier ce souvenir ? Cette action est irréversible.')) {
      try {
        await api.delete(`/memory/${id}`);
        fetchMemory();
      } catch (error) {
        console.error('Error deleting memory:', error);
      }
    }
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setEditForm({ 
      decision: item.decision, 
      context: item.context, 
      responsible: item.responsible 
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    try {
      await api.put(`/memory/${selectedItem.id}`, editForm);
      setIsEditModalOpen(false);
      fetchMemory();
    } catch (error) {
      console.error('Error updating memory:', error);
    }
  };

  const filteredItems = items.filter(item => 
    (item.decision && item.decision.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.context && item.context.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <PageTransition>
      <div className="container" style={{ height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1>Mémoire Active</h1>
            <p className="text-muted">Historique des décisions et actions</p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="input" 
                placeholder="Rechercher..." 
                style={{ paddingLeft: '2.5rem', width: '250px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.25rem', borderRadius: 'var(--radius-md)', display: 'flex' }}>
              <button 
                onClick={() => setViewMode('list')}
                className={`btn ${viewMode === 'list' ? 'btn-primary' : ''}`}
                style={{ padding: '0.5rem', border: 'none', background: viewMode === 'list' ? undefined : 'transparent' }}
              >
                <Grid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('graph')}
                className={`btn ${viewMode === 'graph' ? 'btn-primary' : ''}`}
                style={{ padding: '0.5rem', border: 'none', background: viewMode === 'graph' ? undefined : 'transparent' }}
              >
                <Network size={18} />
              </button>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
          {loading ? (
            <p>Chargement du cortex...</p>
          ) : (
            <>
              {viewMode === 'graph' ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ width: '100%', height: '100%' }}
                >
                  <MemoryGraph data={filteredItems} onNodeClick={openEditModal} />
                </motion.div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', height: '100%', paddingRight: '0.5rem' }}>
                  {filteredItems.map((item) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-panel"
                      style={{ padding: '1.5rem', cursor: 'pointer', transition: 'all 0.2s' }}
                      onClick={() => openEditModal(item)}
                      whileHover={{ scale: 1.01, borderColor: 'var(--neon-blue)' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span className="badge badge-primary">ACTION</span>
                            <span className="text-xs text-muted">{format(new Date(item.date), 'dd MMM yyyy HH:mm', { locale: fr })}</span>
                            {item.responsible && <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{item.responsible}</span>}
                          </div>
                          <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{item.decision}</h3>
                          <p className="text-muted" style={{ fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {item.context}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            className="btn" 
                            style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'transparent' }}
                            onClick={(e) => handleDelete(e, item.id)}
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {filteredItems.length === 0 && <p className="text-muted text-center">Aucune trace mémoire trouvée.</p>}
                </div>
              )}
            </>
          )}
        </div>

        {/* Edit Modal */}
        {isEditModalOpen && selectedItem && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsEditModalOpen(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="modal-content"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <h3>Détails du Souvenir</h3>
                <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleUpdate}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Décision / Action</label>
                  <input 
                    type="text"
                    className="input" 
                    value={editForm.decision} 
                    onChange={(e) => setEditForm({...editForm, decision: e.target.value})}
                  />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Contexte</label>
                  <textarea 
                    className="input" 
                    rows="3"
                    value={editForm.context} 
                    onChange={(e) => setEditForm({...editForm, context: e.target.value})}
                  />
                </div>
                
                {selectedItem.document_content && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Document Généré</label>
                    {(() => {
                      try {
                        const doc = JSON.parse(selectedItem.document_content);
                        return (
                          <div style={{ background: '#fff', color: '#1e293b', padding: '2.5rem', borderRadius: '4px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', fontFamily: 'Georgia, serif', position: 'relative' }}>
                            <div style={{ marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                              <div style={{ fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b' }}>Objet</div>
                              <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{doc.subject}</div>
                            </div>
                            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '1rem' }}>
                              {doc.body}
                            </div>
                            <div style={{ marginTop: '3rem', textAlign: 'right', fontStyle: 'italic', color: '#64748b' }}>
                              Signature
                            </div>
                          </div>
                        );
                      } catch (e) {
                        return <p className="text-error">Erreur de chargement du document.</p>;
                      }
                    })()}
                  </div>
                )}

                <div style={{ marginBottom: '2rem' }}>
                  <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Responsable</label>
                  <input 
                    type="text"
                    className="input" 
                    value={editForm.responsible} 
                    onChange={(e) => setEditForm({...editForm, responsible: e.target.value})}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button type="button" className="btn" onClick={() => setIsEditModalOpen(false)}>Fermer</button>
                  <button type="submit" className="btn btn-primary">Enregistrer</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default Memory;
