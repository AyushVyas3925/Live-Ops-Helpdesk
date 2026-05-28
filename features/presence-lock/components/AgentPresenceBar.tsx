'use client';

import type { Agent } from '@/shared/types/ticket.types';

interface AgentPresenceBarProps {
  agents: Agent[];
}

const PALETTE_BG = [
  '#1e3a8a', '#4c1d95', '#78350f', '#134e4a',
  '#1e3a5f', '#3b1764', '#7c2d12', '#14532d',
];

function agentBg(agentId: string): string {
  let hash = 0;
  for (let i = 0; i < agentId.length; i++) hash = agentId.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE_BG[Math.abs(hash) % PALETTE_BG.length];
}

function getInitials(name: string) {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

export default function AgentPresenceBar({ agents }: AgentPresenceBarProps) {
  const visible  = agents.slice(0, 8);
  const overflow = agents.length - 8;

  if (agents.length === 0) return null;

  return (
    <div
      className="av-stack"
      aria-label={`${agents.length} agents online`}
    >
      {visible.map((agent, i) => (
        <div
          key={agent.agentId}
          style={{ position: 'relative', marginLeft: i > 0 ? -6 : 0, zIndex: 10 - i }}
          title={agent.editingTicketId ? `${agent.agentName} — editing #${agent.editingTicketId}` : agent.agentName}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: agentBg(agent.agentId),
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
              border: '2px solid #FFFFFF',
              cursor: 'default',
              transition: 'transform 0.15s',
              userSelect: 'none',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
            onMouseLeave={e => (e.currentTarget.style.transform = '')}
            aria-label={agent.agentName}
          >
            {getInitials(agent.agentName)}
          </div>

          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 9,
              height: 9,
              borderRadius: '50%',
              background: agent.editingTicketId ? '#F59E0B' : '#22C55E',
              border: '2px solid #FFFFFF',
            }}
          />
        </div>
      ))}

      {overflow > 0 && (
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: '#F3F4F6',
            border: '2px solid #FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 700,
            color: '#6B7280',
            marginLeft: -6,
          }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
