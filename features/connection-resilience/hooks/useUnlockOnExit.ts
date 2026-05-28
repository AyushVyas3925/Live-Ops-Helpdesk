'use client';

import { useEffect } from 'react';
import { useSocket } from '@/shared/context/SocketContext';

export function useUnlockOnExit(ticketId: string | null) {
  const socket = useSocket();

  useEffect(() => {
    if (!ticketId) return;

    const handleUnload = () => socket.emit('unlock_ticket', { ticketId });
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [ticketId, socket]);
}
