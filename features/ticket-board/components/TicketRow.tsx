'use client';

import { formatDistanceToNow } from 'date-fns';
import type { Ticket, LockState } from '@/shared/types/ticket.types';
import { useAgent } from '@/shared/context/AgentContext';
import LockBadge from '@/features/presence-lock/components/LockBadge';

const PRIORITY_STYLES = {
  critical: 'bg-[#FCEBEB] text-[#A32D2D] border border-red-200/60',
  high: 'bg-[#FAEEDA] text-[#854F0B] border border-amber-200/60',
  normal: 'bg-[#E6F1FB] text-[#0C447C] border border-blue-200/60',
} as const;

const STATUS_STYLES = {
  open: 'bg-[#EAF3DE] text-[#27500A] border border-green-200/60',
  in_progress: 'bg-[#E6F1FB] text-[#0C447C] border border-blue-200/60',
  closed: 'bg-[#F1EFE8] text-[#5F5E5A] border border-gray-200',
} as const;

const STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In Progress',
  closed: 'Closed',
} as const;

interface TicketRowProps {
  ticket: Ticket;
  lock: LockState | null;
  isNew: boolean;
  onEdit: (ticket: Ticket) => void;
}

export default function TicketRow({ ticket, lock, isNew, onEdit }: TicketRowProps) {
  const { agentId } = useAgent();

  const isLockedByMe = lock?.agentId === agentId;
  const isLockedByOther = !!lock && !isLockedByMe;

  const rowClass = [
    'grid grid-cols-[80px_1fr_90px_95px_130px_100px_85px] items-center gap-4 px-6 py-3 border-l-[4px] transition-colors duration-200',
    isNew ? 'ticket-new bg-blue-50/40 border-l-blue-400' : '',
    isLockedByOther ? 'bg-gray-100 border-l-red-500' : '',
    isLockedByMe ? 'bg-blue-50/40 border-l-blue-500' : '',
    !lock ? 'bg-white border-l-green-500 hover:bg-gray-50/50' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={rowClass}
      role="row"
      aria-label={`Ticket ${ticket.id}: ${ticket.subject}`}
    >
      {/* Monospace Ticket ID */}
      <span className="font-[family-name:var(--font-mono)] text-xs text-gray-600 tracking-tight font-medium">
        #{ticket.id}
      </span>

      {/* Subject and lock status */}
      <div className="min-w-0 pr-2">
        <p className={`text-xs font-semibold truncate ${isLockedByOther ? 'text-gray-500' : 'text-gray-900'}`}>
          {ticket.subject}
        </p>
        <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
          <i className="ti ti-map-pin" />
          {ticket.location}
        </p>
        {lock && (
          <div className="mt-1">
            <LockBadge agentName={lock.agentName} isOwnLock={isLockedByMe} />
          </div>
        )}
      </div>

      {/* Priority Badge */}
      <div>
        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${PRIORITY_STYLES[ticket.priority]}`}>
          {ticket.priority}
        </span>
      </div>

      {/* Status Badge */}
      <div>
        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-semibold ${STATUS_STYLES[ticket.status]}`}>
          {STATUS_LABELS[ticket.status]}
        </span>
      </div>

      {/* Assigned Agent Details */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-6 h-6 rounded-full bg-gray-50 border border-gray-300 flex items-center justify-center text-[10px] font-bold text-gray-900 flex-shrink-0 uppercase">
          {ticket.agentName.split(' ').map(p => p[0]).join('')}
        </div>
        <span className={`text-xs font-medium truncate ${isLockedByOther ? 'text-gray-500' : 'text-gray-700'}`}>
          {ticket.agentName}
        </span>
      </div>

      {/* Actions & Relative Time */}
      <div className="flex items-center justify-between gap-2 pl-1">
        <span className="font-[family-name:var(--font-mono)] text-[10px] text-gray-400 whitespace-nowrap">
          {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
        </span>
        
        <button
          id={`edit-btn-${ticket.id}`}
          onClick={() => !isLockedByOther && onEdit(ticket)}
          disabled={isLockedByOther}
          aria-disabled={isLockedByOther}
          aria-label={isLockedByOther ? `Ticket ${ticket.id} is locked by ${lock?.agentName}` : `Edit ticket ${ticket.id}`}
          className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-semibold transition-all duration-150 ${
            isLockedByOther
              ? 'opacity-45 cursor-not-allowed bg-gray-50 border border-gray-200 text-gray-500'
              : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm cursor-pointer'
          }`}
        >
          {isLockedByOther ? (
            <i className="ti ti-lock text-[10px]" aria-hidden="true" />
          ) : (
            <i className="ti ti-edit text-[10px]" aria-hidden="true" />
          )}
          {isLockedByOther ? 'Locked' : 'Edit'}
        </button>
      </div>
    </div>
  );
}

