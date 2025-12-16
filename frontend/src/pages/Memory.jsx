import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Search, Grid, Network, Filter } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import MemoryGraph from '../components/MemoryGraph';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Memory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('graph'); // 'list' or 'graph'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMemory();
  }, []);

  const fetchMemory = async () => {
    try {
      // Fetching all items for now, ideally pagination for list, all for graph (or clustered)
      const response = await api.get('/inbox/', { params: { status: 'archived' } }); 
      // Note: Assuming archived items are "memory". 
      // If there's a specific memory endpoint, use that. 
      // Based on previous code, process_inbox_item creates MemoryTrace but we might need an endpoint to fetch MemoryTraces specifically.
      // For MVP/Phase 1 we might have just used inbox archived. 
      // Let's check if we have a memory endpoint. If not, we use inbox archived as a proxy or I'll need to create one.
      // Checking inbox.py... it has get_inbox_items. 
      // I'll stick with inbox archived for now as "Memory" representation.
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching memory:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => 
    item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.action && item.action.toLowerCase().includes(searchTerm.toLowerCase()))
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
                  <MemoryGraph data={filteredItems} />
                </motion.div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', height: '100%', paddingRight: '0.5rem' }}>
                  {filteredItems.map((item) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-panel"
                      style={{ padding: '1.5rem' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span className="badge badge-info">{item.type?.toUpperCase() || 'INFO'}</span>
                        <span className="text-xs text-muted">{format(new Date(item.created_at), 'dd MMM yyyy', { locale: fr })}</span>
                      </div>
                      <h4 style={{ marginBottom: '0.5rem' }}>{item.content}</h4>
                      {item.action && (
                        <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', borderLeft: '2px solid var(--neon-purple)' }}>
                          <p className="text-sm" style={{ margin: 0 }}><strong style={{ color: '#a78bfa' }}>Action :</strong> {item.action}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default Memory;
