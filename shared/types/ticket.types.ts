export type Priority = 'critical' | 'high' | 'normal';
export type TicketStatus = 'open' | 'in_progress' | 'closed';
export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

export interface Ticket {
  id: string;
  subject: string;
  priority: Priority;
  status: TicketStatus;
  agentId: string;
  agentName: string;
  createdAt: string;
  description: string;
  location: string;
}

export interface LockState {
  ticketId: string;
  agentId: string;
  agentName: string;
  lockedAt: string;
}

export interface Agent {
  agentId: string;
  agentName: string;
  editingTicketId: string | null;
}

export interface TicketLockPayload {
  ticketId: string;
  agentId: string;
  agentName: string;
}

export interface TicketUnlockPayload {
  ticketId: string;
}
