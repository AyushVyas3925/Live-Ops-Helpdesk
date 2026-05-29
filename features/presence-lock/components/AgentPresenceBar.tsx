'use client';

import type { Agent } from '@/shared/types/ticket.types';
import { getPresenceAgentBg } from '@/shared/constants/theme';
import { getInitials } from '@/shared/utils/stringUtils';

interface AgentPresenceBarProps {
  agents: Agent[];
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
          style={{ zIndex: 10 - i }}
          className="relative"
          title={agent.editingTicketId ? `${agent.agentName} — editing #${agent.editingTicketId}` : agent.agentName}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold border-2 border-white cursor-default transition-transform duration-150 select-none hover:scale-110 text-white ${getPresenceAgentBg(agent.agentId)}`}
            aria-label={agent.agentName}
          >
            {getInitials(agent.agentName)}
          </div>

          <span
            aria-hidden="true"
            className={`absolute bottom-0 right-0 w-[9px] h-[9px] rounded-full border-2 border-white ${agent.editingTicketId ? 'bg-amber-500' : 'bg-green-500'}`}
          />
        </div>
      ))}

      {overflow > 0 && (
        <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[11px] font-bold text-gray-500">
          +{overflow}
        </div>
      )}
    </div>
  );
}
