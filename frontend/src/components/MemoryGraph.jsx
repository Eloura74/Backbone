import React, { useEffect, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { useNavigate } from 'react-router-dom';

const MemoryGraph = ({ data, onNodeClick }) => {
  const graphRef = useRef();
  const [dimensions, setDimensions] = useState({ w: window.innerWidth - 300, h: window.innerHeight - 100 });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        w: document.getElementById('graph-container')?.clientWidth || window.innerWidth - 300,
        h: window.innerHeight - 150
      });
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Transform data into graph format
  // We create a central "Core" node and link everything to it for now, 
  // or link by tags if available.
  const graphData = React.useMemo(() => {
    if (!data || data.length === 0) return { nodes: [], links: [] };

    const nodes = [
      { id: 'CORE', name: 'MÉMOIRE CENTRALE', val: 20, color: '#fff' },
      ...data.map(item => ({
        id: item.id,
        name: item.action || item.content?.substring(0, 20) + '...',
        val: 5,
        group: item.type || 'info',
        fullItem: item
      }))
    ];

    const links = data.map(item => ({
      source: 'CORE',
      target: item.id
    }));

    return { nodes, links };
  }, [data]);

  return (
    <div id="graph-container" style={{ width: '100%', height: '100%', background: '#020617', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
      <ForceGraph2D
        ref={graphRef}
        width={dimensions.w}
        height={dimensions.h}
        graphData={graphData}
        nodeLabel="name"
        nodeColor={node => {
          if (node.id === 'CORE') return '#ffffff';
          switch(node.group) {
            case 'rh': return '#a78bfa';
            case 'urgence': return '#f87171';
            case 'facturation': return '#fbbf24';
            default: return '#38bdf8';
          }
        }}
        nodeRelSize={6}
        linkColor={() => 'rgba(255,255,255,0.1)'}
        backgroundColor="#020617"
        onNodeClick={(node) => {
          if (node.id !== 'CORE' && onNodeClick) {
            onNodeClick(node.fullItem);
          }
        }}
        cooldownTicks={100}
        onEngineStop={() => graphRef.current.zoomToFit(400)}
      />
    </div>
  );
};

export default MemoryGraph;
