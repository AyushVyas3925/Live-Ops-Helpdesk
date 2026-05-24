import { io } from 'socket.io-client';

// Stagger reconnection across 50 agents to prevent thundering herd on server restart
export const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000', {
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  randomizationFactor: 0.5,
  transports: ['websocket'],
  autoConnect: false,
});
