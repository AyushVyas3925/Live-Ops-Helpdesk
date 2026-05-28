'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/shared/context/SocketContext';
import { useAgent } from '@/shared/context/AgentContext';
import type { LockState, TicketLockPayload, TicketUnlockPayload, Agent } from '@/shared/types/ticket.types';

export function useTicketLock() {
  const socket = useSocket();
  const agent = useAgent();
  const [locks, setLocks] = useState<Map<string, LockState>>(new Map());
  const [connectedAgents, setConnectedAgents] = useState<Agent[]>([]);

  useEffect(() => {
    const onTicketLocked = (lock: LockState) => {
      setLocks(prev => new Map(prev).set(lock.ticketId, lock));
    };

    const onTicketUnlocked = ({ ticketId }: TicketUnlockPayload) => {
      setLocks(prev => {
        const next = new Map(prev);
        next.delete(ticketId);
        return next;
      });
    };

    const onLockState = (allLocks: LockState[]) => {
      setLocks(new Map(allLocks.map(l => [l.ticketId, l])));
    };

    const onAgentJoined = (newAgent: Agent) => {
      setConnectedAgents(prev => [...prev.filter(a => a.agentId !== newAgent.agentId), newAgent]);
    };

    const onAgentLeft = ({ agentId }: { agentId: string }) => {
      setConnectedAgents(prev => prev.filter(a => a.agentId !== agentId));
    };

    const onPresenceUpdate = (agents: Agent[]) => {
      setConnectedAgents(agents);
    };

    const onConnect = () => socket.emit('get_lock_state');

    socket.on('ticket_locked', onTicketLocked);
    socket.on('ticket_unlocked', onTicketUnlocked);
    socket.on('lock_state', onLockState);
    socket.on('agent_joined', onAgentJoined);
    socket.on('agent_left', onAgentLeft);
    socket.on('presence_update', onPresenceUpdate);
    socket.on('connect', onConnect);

    return () => {
      socket.off('ticket_locked', onTicketLocked);
      socket.off('ticket_unlocked', onTicketUnlocked);
      socket.off('lock_state', onLockState);
      socket.off('agent_joined', onAgentJoined);
      socket.off('agent_left', onAgentLeft);
      socket.off('presence_update', onPresenceUpdate);
      socket.off('connect', onConnect);
    };
  }, [socket]);

  const lockTicket = useCallback((ticketId: string) => {
    const payload: TicketLockPayload = {
      ticketId,
      agentId: agent.agentId,
      agentName: agent.agentName,
    };
    socket.emit('lock_ticket', payload);
  }, [socket, agent]);

  const unlockTicket = useCallback((ticketId: string) => {
    socket.emit('unlock_ticket', { ticketId } satisfies TicketUnlockPayload);
  }, [socket]);

  return { locks, connectedAgents, lockTicket, unlockTicket };
}
