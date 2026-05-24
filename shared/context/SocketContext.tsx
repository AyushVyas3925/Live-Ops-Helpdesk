'use client';

import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { socket } from '@/shared/socket/socketClient';
import type { Agent } from '@/shared/types/ticket.types';
import { useAgent } from './AgentContext';

interface SocketContextValue {
  socket: typeof socket;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const agent = useAgent();

  useEffect(() => {
    socket.connect();

    socket.on('connect', () => {
      const agentPayload: Agent = {
        agentId: agent.agentId,
        agentName: agent.agentName,
        editingTicketId: null,
      };
      socket.emit('agent_join', agentPayload);
    });

    return () => {
      socket.disconnect();
    };
  }, [agent.agentId, agent.agentName]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used inside SocketProvider');
  return ctx.socket;
}
