'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/shared/context/SocketContext';
import type { ConnectionStatus } from '@/shared/types/ticket.types';

export function useConnectionStatus() {
  const socket = useSocket();
  const [status, setStatus] = useState<ConnectionStatus>(
    socket.connected ? 'connected' : 'disconnected'
  );

  useEffect(() => {
    const onConnect = () => setStatus('connected');
    const onDisconnect = () => setStatus('disconnected');
    const onReconnectAttempt = () => setStatus('reconnecting');

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.io.on('reconnect_attempt', onReconnectAttempt);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.io.off('reconnect_attempt', onReconnectAttempt);
    };
  }, [socket]);

  return status;
}
