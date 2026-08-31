import React, { useState } from 'react';
import {
  AlertOctagon,
  Boxes,
  Cpu,
  FileText,
  KeyRound,
  MapPin,
  ShieldAlert,
  UserCheck,
  Users,
} from 'lucide-react';

export interface ThreatNode {
  id: string;
  label: string;
  type: 'USER' | 'DEVICE' | 'PAPER' | 'PACKAGE' | 'LOCATION' | 'ALERT' | 'EVENT';
  risk?: number;
}

export interface ThreatEdge {
  from: string;
  to: string;
  label: string;
}

interface ThreatGraphProps {
  nodes: ThreatNode[];
  edges: ThreatEdge[];
  onSelectNode?: (node: ThreatNode) => void;
}

export const ThreatGraph: React.FC<ThreatGraphProps> = ({ nodes, edges, onSelectNode }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  if (nodes.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center border border-dashed border-slate-800 rounded-xl text-xs text-slate-500 font-mono">
        No active relationship graph nodes for this docket.
      </div>
    );
  }

  // Calculate layout coordinates along an ellipse / concentric orbits
  const width = 680;
  const height = 360;
  const centerX = width / 2;
  const centerY = height / 2;

  const nodePositions = new Map<string, { x: number; y: number }>();

  // Center the event/alert node if present
  const centerNode = nodes.find((n) => n.type === 'EVENT' || n.type === 'ALERT') || nodes[0];
  nodePositions.set(centerNode.id, { x: centerX, y: centerY });

  const otherNodes = nodes.filter((n) => n.id !== centerNode.id);
  otherNodes.forEach((node, idx) => {
    const angle = (idx / otherNodes.length) * Math.PI * 2;
    const radiusX = 220;
    const radiusY = 120;
    const x = centerX + Math.cos(angle) * radiusX;
    const y = centerY + Math.sin(angle) * radiusY;
    nodePositions.set(node.id, { x, y });
  });

  const getNodeColor = (node: ThreatNode) => {
    if ((node.risk ?? 0) >= 80) return '#ef4444';
    if ((node.risk ?? 0) >= 60) return '#f59e0b';
    switch (node.type) {
      case 'USER':
        return '#3b82f6';
      case 'DEVICE':
        return '#10b981';
      case 'PAPER':
        return '#8b5cf6';
      case 'PACKAGE':
        return '#06b6d4';
      case 'LOCATION':
        return '#eab308';
      default:
        return '#94a3b8';
    }
  };

  const handleNodeClick = (node: ThreatNode) => {
    setSelectedNodeId(node.id);
    if (onSelectNode) onSelectNode(node);
  };

  return (
    <div className="relative w-full overflow-hidden bg-slate-950/80 border border-slate-800 rounded-xl p-3 shadow-inner">
      <div className="absolute top-3 left-3 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
        Interactive Threat Correlation Graph
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[380px]">
        {/* Render Edges */}
        {edges.map((edge, idx) => {
          const fromPos = nodePositions.get(edge.from);
          const toPos = nodePositions.get(edge.to);
          if (!fromPos || !toPos) return null;

          const midX = (fromPos.x + toPos.x) / 2;
          const midY = (fromPos.y + toPos.y) / 2;

          return (
            <g key={`edge-${idx}`}>
              <line
                x1={fromPos.x}
                y1={fromPos.y}
                x2={toPos.x}
                y2={toPos.y}
                stroke="#334155"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <rect
                x={midX - 35}
                y={midY - 8}
                width="70"
                height="16"
                rx="4"
                fill="#0f172a"
                stroke="#1e293b"
              />
              <text
                x={midX}
                y={midY + 3}
                textAnchor="middle"
                fontSize="8"
                fill="#94a3b8"
                fontFamily="monospace"
              >
                {edge.label}
              </text>
            </g>
          );
        })}

        {/* Render Nodes */}
        {nodes.map((node) => {
          const pos = nodePositions.get(node.id);
          if (!pos) return null;
          const isSelected = selectedNodeId === node.id;
          const color = getNodeColor(node);

          return (
            <g
              key={node.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              onClick={() => handleNodeClick(node)}
              className="cursor-pointer group"
            >
              {/* Outer halo */}
              <circle
                r={isSelected ? 26 : 22}
                fill={color}
                fillOpacity={isSelected ? 0.25 : 0.15}
                stroke={color}
                strokeWidth={isSelected ? 2.5 : 1.5}
                className="transition-all duration-200"
              />
              {/* Inner core */}
              <circle r="12" fill="#0f172a" stroke={color} strokeWidth="2" />
              {/* Text label */}
              <text
                y="34"
                textAnchor="middle"
                fontSize="9"
                fontWeight="bold"
                fill="#f1f5f9"
                fontFamily="sans-serif"
              >
                {node.label.length > 20 ? node.label.slice(0, 18) + '...' : node.label}
              </text>
              {/* Risk tag if present */}
              {node.risk !== undefined && (
                <text
                  y="45"
                  textAnchor="middle"
                  fontSize="8"
                  fill={color}
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  Risk: {node.risk}/100
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
