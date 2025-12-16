import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, AlertCircle, FileText, Phone, Mail, MessageSquare, Plus, X, ArrowRight } from 'lucide-react';
import api from '../api/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import PageTransition from '../components/PageTransition';
import { motion } from 'framer-motion';
import Tilt from 'react-parallax-tilt';

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
  const [generatedDoc, setGeneratedDoc] = useState(null);

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
    setGeneratedDoc(null);
    setIsProcessModalOpen(true);
  };

  const handleGenerate = async (templateType) => {
    if (!selectedItem) return;
    try {
      const response = await api.post(`/inbox/${selectedItem.id}/generate`, { template_type: templateType });
      setGeneratedDoc(response.data);
    } catch (error) {
      console.error('Error generating document:', error);
    }
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <PageTransition>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h1>Inbox Unifiée</h1>
            <p className="text-muted">Centralisation des flux entrants</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-primary" 
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={18} style={{ marginRight: '0.5rem' }} />
            Nouvelle Entrée
          </motion.button>
        </div>

        {loading ? (
          <p>Chargement...</p>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >


            {items.map((item) => (
              <Tilt 
                key={item.id} 
                tiltMaxAngleX={2} 
                tiltMaxAngleY={2} 
                perspective={1000} 
                scale={1.02}
                transitionSpeed={1500}
                className="glass-panel"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <motion.div 
                  variants={itemVariants}
                  style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem', height: '100%' }}
                >
                  <div style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)', transform: 'translateZ(20px)' }}>
                    {getIcon(item.source)}
                  </div>
                  
                  <div style={{ flex: 1, transform: 'translateZ(10px)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      {getStatusBadge(item.type)}
                      <span className="text-xs text-muted">
                        {format(new Date(item.created_at), 'dd MMM HH:mm', { locale: fr })}
                      </span>
                      {/* Neural Insight Badge */}
                      {['urgence', 'facturation'].includes(item.type) && (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(14, 165, 233, 0.1)', padding: '0.1rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(14, 165, 233, 0.2)' }}
                        >
                          <span style={{ fontSize: '0.65rem', color: '#38bdf8', fontWeight: 'bold' }}>CORTEX: {item.type === 'urgence' ? 'PRIORITÉ HAUTE' : 'ANALYSE FINANCIÈRE'}</span>
                        </motion.div>
                      )}
                    </div>
                    <div style={{ fontWeight: 500, fontSize: '1.1rem', letterSpacing: '-0.01em' }}>{item.content}</div>
                  </div>

                  <div style={{ transform: 'translateZ(20px)' }}>
                    <motion.button 
                      whileHover={{ scale: 1.1, color: '#22c55e' }}
                      whileTap={{ scale: 0.9 }}
                      className="btn" 
                      onClick={(e) => { e.stopPropagation(); openProcessModal(item); }} 
                      title="Traiter"
                      style={{ padding: '0.75rem' }}
                    >
                      <CheckCircle size={20} />
                    </motion.button>
                  </div>
                </motion.div>
              </Tilt>
            ))}
            
            {items.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-muted" 
                style={{ textAlign: 'center', padding: '6rem', background: 'rgba(255,255,255,0.01)', borderRadius: 'var(--radius-lg)', border: '1px dashed rgba(255,255,255,0.05)' }}
              >
                <CheckCircle size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                <p>Aucune entrée en attente. Tout est calme.</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Add Item Modal */}
        {isAddModalOpen && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsAddModalOpen(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="modal-content"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <h3>Nouvelle Entrée</h3>
                <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleAddItem}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Source</label>
                  <select className="input" value={newItem.source} onChange={(e) => setNewItem({...newItem, source: e.target.value})}>
                    <option value="note">Note Rapide</option>
                    <option value="email">Email</option>
                    <option value="call">Appel</option>
                    <option value="internal">Interne</option>
                  </select>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
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
                <div style={{ marginBottom: '2rem' }}>
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
            </motion.div>
          </div>
        )}

        {/* Process Modal */}
        {isProcessModalOpen && selectedItem && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsProcessModalOpen(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="modal-content"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <h3>Traiter la demande</h3>
                <button onClick={() => setIsProcessModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', fontSize: '1rem', borderLeft: '4px solid var(--neon-blue)' }}>
                <p style={{ margin: 0, color: 'var(--text-primary)' }}>{selectedItem.content}</p>
              </div>

              {/* --- GENERATOR MODULE START --- */}
              <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(14, 165, 233, 0.05)', borderRadius: 'var(--radius-md)', border: '1px dashed rgba(14, 165, 233, 0.2)' }}>
                <h4 style={{ marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--neon-blue)' }}>
                  <FileText size={16} /> Générateur de Documents
                </h4>
                
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  {/* DYNAMIC ACTIONS BASED ON TYPE */}
                  {selectedItem.type === 'facturation' && (
                    <>
                      <button type="button" className="btn" onClick={() => handleGenerate('facture_paiement')} style={{ fontSize: '0.8rem' }}>Preuve Virement</button>
                      <button type="button" className="btn" onClick={() => handleGenerate('facture_relance')} style={{ fontSize: '0.8rem' }}>Relance Impayé</button>
                      <button type="button" className="btn" onClick={() => handleGenerate('facture_contestation')} style={{ fontSize: '0.8rem' }}>Contester</button>
                    </>
                  )}

                  {selectedItem.type === 'rh' && (
                    <>
                      <button type="button" className="btn" onClick={() => handleGenerate('rh_convocation')} style={{ fontSize: '0.8rem' }}>Convocation</button>
                      <button type="button" className="btn" onClick={() => handleGenerate('rh_offre')} style={{ fontSize: '0.8rem' }}>Offre Emploi</button>
                      <button type="button" className="btn" onClick={() => handleGenerate('direction_note')} style={{ fontSize: '0.8rem' }}>Note Service</button>
                    </>
                  )}

                  {selectedItem.type === 'logement' && (
                    <>
                      <button type="button" className="btn" onClick={() => handleGenerate('logement_preavis')} style={{ fontSize: '0.8rem' }}>Préavis Départ</button>
                      <button type="button" className="btn" onClick={() => handleGenerate('logement_sinistre')} style={{ fontSize: '0.8rem' }}>Déclarer Sinistre</button>
                      <button type="button" className="btn" onClick={() => handleGenerate('email_rdv')} style={{ fontSize: '0.8rem' }}>RDV État des lieux</button>
                    </>
                  )}

                  {selectedItem.type === 'direction' && (
                    <>
                      <button type="button" className="btn" onClick={() => handleGenerate('direction_cr')} style={{ fontSize: '0.8rem' }}>Compte-Rendu</button>
                      <button type="button" className="btn" onClick={() => handleGenerate('direction_note')} style={{ fontSize: '0.8rem' }}>Note Interne</button>
                    </>
                  )}

                  {selectedItem.type === 'urgence' && (
                    <>
                      <button type="button" className="btn" onClick={() => handleGenerate('urgence_signalement')} style={{ fontSize: '0.8rem', borderColor: 'var(--neon-red)', color: '#f87171' }}>SIGNALEMENT CRITIQUE</button>
                      <button type="button" className="btn" onClick={() => handleGenerate('email_rdv')} style={{ fontSize: '0.8rem' }}>Intervention Rapide</button>
                    </>
                  )}

                  {['info', 'note'].includes(selectedItem.type) && (
                    <>
                      <button type="button" className="btn" onClick={() => handleGenerate('email_rdv')} style={{ fontSize: '0.8rem' }}>Confirmer RDV</button>
                      <button type="button" className="btn" onClick={() => handleGenerate('direction_cr')} style={{ fontSize: '0.8rem' }}>Synthèse</button>
                    </>
                  )}
                </div>

                {generatedDoc && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}
                  >
                    <div style={{ marginBottom: '0.5rem' }}>
                      <span className="text-xs text-muted">OBJET:</span> <span style={{ fontWeight: 'bold' }}>{generatedDoc.subject}</span>
                    </div>
                    <textarea 
                      className="input" 
                      rows="6" 
                      value={generatedDoc.body} 
                      readOnly 
                      style={{ fontSize: '0.9rem', fontFamily: 'monospace', marginBottom: '1rem' }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button type="button" className="btn" onClick={() => navigator.clipboard.writeText(`${generatedDoc.subject}\n\n${generatedDoc.body}`)} title="Copier">
                        Copier
                      </button>
                      <button type="button" className="btn" onClick={() => {
                        const element = document.createElement("a");
                        const file = new Blob([`${generatedDoc.subject}\n\n${generatedDoc.body}`], {type: 'text/plain'});
                        element.href = URL.createObjectURL(file);
                        element.download = "document.txt";
                        document.body.appendChild(element);
                        element.click();
                      }} title="Télécharger">
                        Télécharger
                      </button>
                      <button type="button" className="btn btn-primary" onClick={() => window.open(`mailto:?subject=${encodeURIComponent(generatedDoc.subject)}&body=${encodeURIComponent(generatedDoc.body)}`)} title="Envoyer par Email">
                        <Mail size={16} style={{ marginRight: '0.5rem' }} /> Envoyer
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
              {/* --- GENERATOR MODULE END --- */}

              <form onSubmit={handleProcessItem}>
                <div style={{ marginBottom: '1.5rem' }}>
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
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="text-sm text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Contexte supplémentaire (Optionnel)</label>
                  <input 
                    type="text" 
                    className="input" 
                    value={processData.context} 
                    onChange={(e) => setProcessData({...processData, context: e.target.value})}
                    placeholder="Détails utiles pour la mémoire..."
                  />
                </div>
                <div style={{ marginBottom: '2rem' }}>
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
            </motion.div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default Inbox;
