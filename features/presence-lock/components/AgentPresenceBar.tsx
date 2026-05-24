'use client';

import type { Agent } from '@/shared/types/ticket.types';

interface AgentPresenceBarProps {
  agents: Agent[];
}

function agentColor(agentId: string): string {
  const palette = [
    'bg-blue-600', 'bg-emerald-600', 'bg-violet-600',
    'bg-amber-600', 'bg-rose-600', 'bg-cyan-600',
    'bg-indigo-600', 'bg-orange-600',
  ];
  let hash = 0;
  for (let i = 0; i < agentId.length; i++) hash = agentId.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

function getInitials(name: string) {
  return name.split(' ').map(p => p[0]).join('').toUpperCase();
}

export default function AgentPresenceBar({ agents }: AgentPresenceBarProps) {
  const visible = agents.slice(0, 8);
  const overflow = agents.length - 8;

  if (agents.length === 0) return null;

  return (
    <div className="flex items-center gap-1" aria-label="Active agents">
      {visible.map(agent => (
        <div key={agent.agentId} className="relative group">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${agentColor(agent.agentId)}`}
            title={agent.editingTicketId ? `${agent.agentName} — editing #${agent.editingTicketId}` : agent.agentName}
          >
            {getInitials(agent.agentName)}
          </div>
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${
              agent.editingTicketId ? 'bg-amber-500' : 'bg-green-500'
            }`}
            aria-hidden="true"
          />
          <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
            <div className="bg-gray-900 text-white text-[9px] rounded px-2 py-1 whitespace-nowrap shadow-md border border-gray-700">
              {agent.agentName}
              {agent.editingTicketId && (
                <span className="text-amber-300 font-mono ml-1">· #{agent.editingTicketId}</span>
              )}
            </div>
          </div>
        </div>
      ))}
      {overflow > 0 && (
        <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center text-[9px] font-bold text-gray-600">
          +{overflow}
        </div>
      )}
    </div>
  );
}

