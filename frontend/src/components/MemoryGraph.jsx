import React, { useEffect, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { useNavigate } from 'react-router-dom';

const MemoryGraph = ({ data, onNodeClick }) => {
  const graphRef = useRef();
  const [dimensions, setDimensions] = useState({ w: window.innerWidth - 300, h: window.innerHeight - 100 });
  const [hoverNode, setHoverNode] = useState(null);

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

  const graphData = React.useMemo(() => {
    if (!data || data.length === 0) return { nodes: [], links: [] };

    const nodes = [
      { id: 'CORE', name: 'CORTEX', val: 40, color: '#fff', type: 'core' },
      ...data.map(item => ({
        id: item.id,
        name: item.decision || item.content?.substring(0, 20) + '...',
        val: 15,
        group: item.type || 'info',
        fullItem: item,
        color: item.type === 'urgence' ? '#ef4444' : 
               item.type === 'rh' ? '#a78bfa' : 
               item.type === 'facturation' ? '#fbbf24' : '#38bdf8'
      }))
    ];

    const links = data.map(item => ({
      source: 'CORE',
      target: item.id
    }));

    return { nodes, links };
  }, [data]);

  return (
    <div id="graph-container" style={{ width: '100%', height: '100%', background: 'radial-gradient(circle at center, #1e293b 0%, #020617 100%)', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, pointerEvents: 'none' }}>
        <h3 style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', letterSpacing: '2px' }}>NEURAL NETWORK V2.0</h3>
      </div>
      <ForceGraph2D
        ref={graphRef}
        width={dimensions.w}
        height={dimensions.h}
        graphData={graphData}
        nodeLabel="name"
        nodeColor="color"
        nodeRelSize={8}
        linkColor={link => (hoverNode && (link.source.id === hoverNode.id || link.target.id === hoverNode.id)) ? '#ffffff' : 'rgba(56, 189, 248, 0.2)'}
        linkWidth={link => (hoverNode && (link.source.id === hoverNode.id || link.target.id === hoverNode.id)) ? 3 : 1}
        linkDirectionalParticles={4}
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalParticleWidth={2}
        backgroundColor="rgba(0,0,0,0)"
        onNodeHover={setHoverNode}
        onNodeClick={(node) => {
          if (node.id !== 'CORE' && onNodeClick) {
            onNodeClick(node.fullItem);
          }
        }}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const isHover = hoverNode === node;
          const label = node.name;
          const fontSize = (isHover ? 14 : 12) / globalScale;
          
          // Node Drawing
          ctx.beginPath();
          const size = node.id === 'CORE' ? 20 : 8;
          ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
          ctx.fillStyle = node.color;
          
          // Glow
          ctx.shadowBlur = isHover ? 30 : 15;
          ctx.shadowColor = node.color;
          ctx.fill();
          
          // Reset shadow for text
          ctx.shadowBlur = 0;

          // Text Label Background
          ctx.font = `${isHover ? 'bold' : ''} ${fontSize}px Sans-Serif`;
          const textWidth = ctx.measureText(label).width;
          const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.5);
          
          if (isHover || node.id === 'CORE') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y + size + 2, bckgDimensions[0], bckgDimensions[1]);
          }

          // Text Label
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = isHover ? '#fff' : 'rgba(255, 255, 255, 0.8)';
          ctx.fillText(label, node.x, node.y + size + 2 + bckgDimensions[1]/2);

          node.__bckgDimensions = bckgDimensions; 
        }}
        cooldownTicks={100}
        d3VelocityDecay={0.6}
        onEngineStop={() => graphRef.current.zoomToFit(400)}
      />
    </div>
  );
};

export default MemoryGraph;
