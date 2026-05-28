'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/shared/context/SocketContext';
import type { Ticket } from '@/shared/types/ticket.types';

export function useTicketList() {
  const socket = useSocket();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTicketIds, setNewTicketIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/tickets')
      .then(res => res.json())
      .then(data => setTickets(data.tickets))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const onNewTicket = (ticket: Ticket) => {
      setTickets(prev => [ticket, ...prev]);
      setNewTicketIds(prev => new Set(prev).add(ticket.id));

      setTimeout(() => {
        setNewTicketIds(prev => {
          const next = new Set(prev);
          next.delete(ticket.id);
          return next;
        });
      }, 1000);
    };

    socket.on('new_ticket', onNewTicket);
    return () => { socket.off('new_ticket', onNewTicket); };
  }, [socket]);

  const addTicket = useCallback((ticket: Ticket) => {
    setTickets(prev => [ticket, ...prev]);
    setNewTicketIds(prev => new Set(prev).add(ticket.id));
    setTimeout(() => {
      setNewTicketIds(prev => {
        const next = new Set(prev);
        next.delete(ticket.id);
        return next;
      });
    }, 1000);
  }, []);

  return { tickets, isLoading, newTicketIds, addTicket };
}
