import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, AlertCircle, FileText, Phone, Mail, MessageSquare, Plus, X, ArrowRight, Trash2, Edit2, Maximize2, Minimize2 } from 'lucide-react';
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
  const [docVariables, setDocVariables] = useState({});
  const [denseMode, setDenseMode] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

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
    const userInput = document.getElementById('generator-input')?.value || '';
    try {
      const response = await api.post(`/inbox/${selectedItem.id}/generate`, { 
        template_type: templateType,
        user_input: userInput
      });
      setGeneratedDoc(response.data);
      setDocVariables({}); // Reset variables on new generation
    } catch (error) {
      console.error('Error generating document:', error);
    }
  };

  const handleProcessItem = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      const finalDoc = generatedDoc ? {
        subject: generatedDoc.subject.replace(/\[(.*?)\]/g, (match) => docVariables[match] || match),
        body: generatedDoc.body.replace(/\[(.*?)\]/g, (match) => docVariables[match] || match)
      } : null;

      await api.post(`/inbox/${selectedItem.id}/process`, {
        ...processData,
        generated_doc: finalDoc
      });
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

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (confirm('Supprimer cet élément ?')) {
      try {
        await api.delete(`/inbox/${id}`);
        fetchItems();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const handleUpdateItem = async (id, newContent) => {
    try {
      await api.put(`/inbox/${id}`, { content: newContent });
      setEditingItem(null);
      fetchItems();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  return (
    <PageTransition>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h1>Inbox Unifiée</h1>
            <p className="text-muted">Centralisation des flux entrants</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
           <button 
            className="btn" 
            onClick={() => setDenseMode(!denseMode)}
            style={{ padding: '0.5rem', background: 'transparent', border: '1px solid var(--border-glass)' }}
            title={denseMode ? "Mode Normal" : "Mode Dense"}
          >
            {denseMode ? <Maximize2 size={20} /> : <Minimize2 size={20} />}
          </button>
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
            {/* DRAG & DROP ZONE */}
            <div 
              style={{ 
                border: '2px dashed var(--border-glass)', 
                borderRadius: 'var(--radius-lg)', 
                padding: '2rem', 
                textAlign: 'center',
                background: 'rgba(255,255,255,0.02)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--neon-blue)'; }}
              onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--border-glass)'; }}
              onDrop={async (e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = 'var(--border-glass)';
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                  const formData = new FormData();
                  formData.append('file', files[0]);
                  try {
                    await api.post('/inbox/upload', formData, {
                      headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    fetchItems();
                  } catch (error) {
                    console.error('Upload failed:', error);
                  }
                }
              }}
            >
              <FileText size={32} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>Glissez vos documents ici (PDF, Excel, Word)</p>
            </div>


            {items.map((item) => (
              <motion.div key={item.id} variants={itemVariants}>
                  <div 
                    className="card" 
                    style={{ 
                      cursor: 'pointer',
                      borderLeft: `4px solid var(--neon-${['urgence', 'facturation'].includes(item.type) ? 'red' : 'blue'})`,
                      padding: denseMode ? '1rem' : '1.5rem',
                      display: 'flex',
                      alignItems: denseMode ? 'center' : 'flex-start',
                      gap: '1rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: 'var(--radius-lg)'
                    }}
                    onClick={() => openProcessModal(item)}
                  >
                    <div style={{ fontSize: denseMode ? '1.5rem' : '2rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
                      {getIcon(item.source)}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                        {getStatusBadge(item.type)}
                        <span className="text-xs text-muted">
                          {format(new Date(item.created_at), 'dd MMM HH:mm', { locale: fr })}
                        </span>
                        {item.source === 'document' && <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>DOC</span>}
                      </div>
                      
                      {editingItem === item.id ? (
                        <div onClick={(e) => e.stopPropagation()}>
                          <textarea 
                            className="input" 
                            defaultValue={item.content} 
                            autoFocus
                            onBlur={(e) => handleUpdateItem(item.id, e.target.value)}
                            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) handleUpdateItem(item.id, e.target.value) }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      ) : (
                        <h3 style={{ 
                          fontSize: denseMode ? '1rem' : '1.25rem', 
                          marginBottom: denseMode ? 0 : '0.5rem',
                          whiteSpace: denseMode ? 'nowrap' : 'normal',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {item.content.split('\n')[0]}
                        </h3>
                      )}
                      
                      {!denseMode && !editingItem && (
                        <p className="text-muted" style={{ fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {item.content.split('\n').slice(1).join(' ')}
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: denseMode ? 'row' : 'column', gap: '0.5rem' }}>
                       <button 
                        className="btn" 
                        style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)' }}
                        onClick={(e) => { e.stopPropagation(); setEditingItem(item.id); }}
                        title="Modifier"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="btn" 
                        style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'transparent' }}
                        onClick={(e) => handleDelete(e, item.id)}
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button 
                        className="btn" 
                        style={{ padding: '0.5rem', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderColor: 'transparent' }}
                        onClick={(e) => { e.stopPropagation(); openProcessModal(item); }}
                        title="Traiter"
                      >
                        <CheckCircle size={16} />
                      </button>
                    </div>
                  </div>
              </motion.div>
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
                
                <div style={{ marginBottom: '1rem' }}>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="Instructions optionnelles (ex: 'Ajouter que je suis absent lundi', 'Ton plus formel')..." 
                    style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', background: 'rgba(0,0,0,0.2)' }}
                    id="generator-input"
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  {/* DYNAMIC ACTIONS BASED ON TYPE */}
                  {selectedItem.type === 'facturation' && (
                    <>
                      <button type="button" className="btn" onClick={() => handleGenerate('facture_paiement')} style={{ fontSize: '0.8rem' }}>Preuve Virement</button>
                      <button type="button" className="btn" onClick={() => handleGenerate('facture_relance_1')} style={{ fontSize: '0.8rem' }}>Relance (Douce)</button>
                      <button type="button" className="btn" onClick={() => handleGenerate('facture_relance_2')} style={{ fontSize: '0.8rem' }}>Relance (Ferme)</button>
                      <button type="button" className="btn" onClick={() => handleGenerate('facture_mise_demeure')} style={{ fontSize: '0.8rem', color: '#f87171', borderColor: '#f87171' }}>Mise en Demeure</button>
                      <button type="button" className="btn" onClick={() => handleGenerate('facture_contestation')} style={{ fontSize: '0.8rem' }}>Contester</button>
                      <button type="button" className="btn" onClick={() => handleGenerate('facture_devis')} style={{ fontSize: '0.8rem' }}>Devis</button>
                      <button type="button" className="btn" onClick={() => handleGenerate('finance_rib')} style={{ fontSize: '0.8rem' }}>Envoyer RIB</button>
                    </>
                  )}

                  {selectedItem.type === 'rh' && (
                    <>
                      <button type="button" className="btn" onClick={() => handleGenerate('rh_convocation')} style={{ fontSize: '0.8rem' }}>Convocation</button>
                      <button type="button" className="btn" onClick={() => handleGenerate('rh_offre')} style={{ fontSize: '0.8rem' }}>Offre Emploi</button>
                      <button type="button" className="btn" onClick={() => handleGenerate('rh_promesse')} style={{ fontSize: '0.8rem' }}>Promesse Embauche</button>
                      <button type="button" className="btn" onClick={() => handleGenerate('rh_conges_validation')} style={{ fontSize: '0.8rem' }}>Valider Congés</button>
                      <button type="button" className="btn" onClick={() => handleGenerate('rh_avertissement')} style={{ fontSize: '0.8rem', color: '#fbbf24', borderColor: '#fbbf24' }}>Avertissement</button>
                      <button type="button" className="btn" onClick={() => handleGenerate('rh_certificat')} style={{ fontSize: '0.8rem' }}>Certificat Travail</button>
                    </>
                  )}

                  {selectedItem.type === 'logement' && (
                    <>
                      <button type="button" className="btn" onClick={() => handleGenerate('logement_preavis')} style={{ fontSize: '0.8rem' }}>Préavis Départ</button>
                      <button type="button" className="btn" onClick={() => handleGenerate('logement_sinistre')} style={{ fontSize: '0.8rem' }}>Déclarer Sinistre</button>
                      <button type="button" className="btn" onClick={() => handleGenerate('logement_quittance')} style={{ fontSize: '0.8rem' }}>Quittance Loyer</button>
                      <button type="button" className="btn" onClick={() => handleGenerate('logement_travaux')} style={{ fontSize: '0.8rem' }}>Demande Travaux</button>
                      <button type="button" className="btn" onClick={() => handleGenerate('email_rdv')} style={{ fontSize: '0.8rem' }}>RDV État des lieux</button>
                    </>
                  )}

                  {selectedItem.type === 'direction' && (
                    <>
                      <button type="button" className="btn" onClick={() => handleGenerate('direction_cr')} style={{ fontSize: '0.8rem' }}>Compte-Rendu</button>
                      <button type="button" className="btn" onClick={() => handleGenerate('direction_note')} style={{ fontSize: '0.8rem' }}>Note Interne</button>
                      <button type="button" className="btn" onClick={() => handleGenerate('direction_odj')} style={{ fontSize: '0.8rem' }}>Ordre du Jour</button>
                      <button type="button" className="btn" onClick={() => handleGenerate('admin_procuration')} style={{ fontSize: '0.8rem' }}>Procuration</button>
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
                      <button type="button" className="btn" onClick={() => handleGenerate('admin_resiliation')} style={{ fontSize: '0.8rem' }}>Résiliation Contrat</button>
                    </>
                  )}
                </div>

                {generatedDoc && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    {/* SMART VARIABLES INPUTS */}
                    {(() => {
                      const placeholders = [...new Set((generatedDoc.body + generatedDoc.subject).match(/\[(.*?)\]/g) || [])];
                      if (placeholders.length > 0) {
                        return (
                          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(14, 165, 233, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--neon-blue)' }}>
                            <h5 style={{ margin: '0 0 1rem 0', color: '#38bdf8', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Edit2 size={14} /> Variables à compléter
                            </h5>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                              {placeholders.map(placeholder => (
                                <div key={placeholder}>
                                  <label className="text-xs text-muted" style={{ display: 'block', marginBottom: '0.25rem' }}>{placeholder.replace(/[\[\]]/g, '')}</label>
                                  <input 
                                    type="text" 
                                    className="input" 
                                    style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                                    placeholder="..."
                                    value={docVariables[placeholder] || ''}
                                    onChange={(e) => setDocVariables({...docVariables, [placeholder]: e.target.value})}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* DOCUMENT PREVIEW */}
                    <div style={{ background: '#fff', color: '#1e293b', padding: '2.5rem', borderRadius: '4px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', fontFamily: 'Georgia, serif', marginBottom: '1.5rem', position: 'relative' }}>
                      <div style={{ marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b' }}>Objet</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                          {generatedDoc.subject.replace(/\[(.*?)\]/g, (match) => docVariables[match] || match)}
                        </div>
                      </div>
                      
                      <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '1rem' }}>
                        {generatedDoc.body.replace(/\[(.*?)\]/g, (match) => {
                          const val = docVariables[match];
                          return val ? val : match;
                        })}
                      </div>

                      {/* Signature Placeholder */}
                      <div style={{ marginTop: '3rem', textAlign: 'right', fontStyle: 'italic', color: '#64748b' }}>
                        Signature
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button type="button" className="btn" onClick={() => {
                        const finalSubject = generatedDoc.subject.replace(/\[(.*?)\]/g, (match) => docVariables[match] || match);
                        const finalBody = generatedDoc.body.replace(/\[(.*?)\]/g, (match) => docVariables[match] || match);
                        navigator.clipboard.writeText(`${finalSubject}\n\n${finalBody}`);
                      }} title="Copier">
                        Copier
                      </button>
                      <button type="button" className="btn" onClick={() => {
                        const finalSubject = generatedDoc.subject.replace(/\[(.*?)\]/g, (match) => docVariables[match] || match);
                        const finalBody = generatedDoc.body.replace(/\[(.*?)\]/g, (match) => docVariables[match] || match);
                        const element = document.createElement("a");
                        const file = new Blob([`${finalSubject}\n\n${finalBody}`], {type: 'text/plain'});
                        element.href = URL.createObjectURL(file);
                        element.download = `document_${format(new Date(), 'yyyyMMdd')}.txt`;
                        document.body.appendChild(element);
                        element.click();
                      }} title="Télécharger">
                        Télécharger
                      </button>
                      <button type="button" className="btn btn-primary" onClick={() => {
                        const finalSubject = generatedDoc.subject.replace(/\[(.*?)\]/g, (match) => docVariables[match] || match);
                        const finalBody = generatedDoc.body.replace(/\[(.*?)\]/g, (match) => docVariables[match] || match);
                        window.open(`mailto:?subject=${encodeURIComponent(finalSubject)}&body=${encodeURIComponent(finalBody)}`);
                      }} title="Envoyer par Email">
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
