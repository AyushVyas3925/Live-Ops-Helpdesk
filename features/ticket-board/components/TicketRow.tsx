'use client';

import type { Ticket, LockState } from '@/shared/types/ticket.types';
import { useAgent } from '@/shared/context/AgentContext';

function formatShortTime(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return '<1m ago';
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 1) return `${diffMins}m ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 1) return `${diffHrs}h ago`;
  return `${diffDays}d ago`;
}

const PRIORITY_PILL: Record<string, string> = {
  critical: 'bg-red-100 text-red-800',
  high:     'bg-amber-100 text-amber-800',
  normal:   'bg-blue-50 text-blue-700',
};

const STATUS_PILL: Record<string, string> = {
  open:        'bg-green-100 text-green-800',
  in_progress: 'bg-blue-50 text-blue-700',
  closed:      'bg-gray-100 text-gray-500',
};

const STATUS_LABEL: Record<string, string> = {
  open: 'Open', in_progress: 'In Progress', closed: 'Closed',
};

const AGENT_BG: Record<string, string> = {
  'Marcus T.':  'bg-[#1e3a8a]',
  'Priya S.':   'bg-[#4c1d95]',
  'Jordan K.':  'bg-[#78350f]',
  'Aisha R.':   'bg-[#134e4a]',
  'Devon L.':   'bg-[#1e3a5f]',
  'Camille W.': 'bg-[#3b1764]',
  'Ravi P.':    'bg-[#7c2d12]',
  'Nadia O.':   'bg-[#14532d]',
  'Tyler B.':   'bg-[#1e1b4b]',
  'Simone F.':  'bg-[#831843]',
};
function agentBg(name: string) {
  return AGENT_BG[name] ?? 'bg-gray-700';
}
function getInitials(name: string) {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

interface TicketRowProps {
  ticket:   Ticket;
  lock:     LockState | null;
  isNew:    boolean;
  onEdit:   (ticket: Ticket) => void;
  onUnlock: (ticketId: string) => void;
}

export default function TicketRow({ ticket, lock, isNew, onEdit, onUnlock }: TicketRowProps) {
  const { agentId } = useAgent();

  const isLockedByMe    = lock?.agentId === agentId;
  const isLockedByOther = !!lock && !isLockedByMe;

  let rowClass = isNew ? 'ticket-new ' : '';
  if (isLockedByOther) rowClass += 'row-locked-other';
  else if (isLockedByMe) rowClass += 'row-locked-me';
  else rowClass += 'row-unlocked';

  const handleRowClick = () => {
    if (!isLockedByOther) onEdit(ticket);
  };

  const priStyle = PRIORITY_PILL[ticket.priority] ?? PRIORITY_PILL.normal;
  const stStyle  = STATUS_PILL[ticket.status]     ?? STATUS_PILL.closed;

  return (
    <div
      className={`${rowClass} grid grid-cols-[80px_1fr_120px_120px_150px_100px_100px] gap-0 py-[13px] px-4 border-b border-[#F1F5F9] items-center relative ${isLockedByOther ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={handleRowClick}
      role="row"
      aria-label={`Ticket ${ticket.id}: ${ticket.subject}`}
    >
      <span className="font-mono text-xs text-gray-500 font-medium">
        #{ticket.id}
      </span>

      <div className="min-w-0 pr-2">
        <div className="flex items-center gap-[7px] min-w-0">
          <span className={`text-[13px] font-medium truncate ${isLockedByOther ? 'text-gray-500' : 'text-gray-900'}`}>
            {ticket.subject}
          </span>

          {isLockedByOther && (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-800 bg-red-100 py-0.5 px-[7px] rounded-full whitespace-nowrap flex-shrink-0"
              aria-label={`Locked by ${lock!.agentName}`}
            >
              <i className="ti ti-lock text-[10px]" aria-hidden="true" />
              Locked by {lock!.agentName}
            </span>
          )}
          {isLockedByMe && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 py-0.5 px-[7px] rounded-full whitespace-nowrap flex-shrink-0">
              <i className="ti ti-lock text-[10px]" aria-hidden="true" />
              You
            </span>
          )}
        </div>
        <p className="text-[11px] text-gray-400 flex items-center gap-[3px] mt-0.5">
          <i className="ti ti-map-pin" />
          {ticket.location}
        </p>
      </div>

      <div className="flex items-center">
        <span className={`inline-flex items-center gap-1 py-[3px] px-[9px] rounded-full text-[11px] font-bold tracking-[0.03em] whitespace-nowrap ${priStyle}`}>
          {ticket.priority === 'critical' && <i className="ti ti-alert-triangle text-[11px]" aria-hidden="true" />}
          {ticket.priority === 'high'     && <i className="ti ti-arrow-up text-[11px]" aria-hidden="true" />}
          {ticket.priority.toUpperCase()}
        </span>
      </div>

      <div>
        <span className={`inline-flex items-center gap-1 py-[3px] px-[9px] rounded-full text-[11px] font-bold whitespace-nowrap ${stStyle}`}>
          {ticket.status === 'open'        && <i className="ti ti-circle text-[10px]" aria-hidden="true" />}
          {ticket.status === 'in_progress' && <i className="ti ti-loader text-[10px]" aria-hidden="true" />}
          {STATUS_LABEL[ticket.status]}
        </span>
      </div>

      <div className={`flex items-center gap-[7px] text-xs ${isLockedByOther ? 'text-gray-400' : 'text-gray-700'}`}>
        <span className={`w-[26px] h-[26px] rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 text-white ${agentBg(ticket.agentName)}`}>
          {getInitials(ticket.agentName)}
        </span>
        <span className="truncate">
          {ticket.agentName}
        </span>
      </div>

      <span className="font-mono text-[11px] text-gray-400 whitespace-nowrap">
        {formatShortTime(ticket.createdAt)}
      </span>

      <span onClick={e => e.stopPropagation()}>
        {isLockedByOther ? (
          <button
            id={`edit-btn-${ticket.id}`}
            disabled
            aria-disabled="true"
            aria-label={`Ticket ${ticket.id} is locked by ${lock?.agentName}`}
            className="btn-action-locked"
          >
            <i className="ti ti-lock text-xs" aria-hidden="true" />
            Locked
          </button>
        ) : isLockedByMe ? (
          <button
            id={`edit-btn-${ticket.id}`}
            onClick={() => onUnlock(ticket.id)}
            aria-label={`Release lock on ticket ${ticket.id}`}
            className="btn-action-release"
          >
            <i className="ti ti-lock-open text-xs" aria-hidden="true" />
            Release
          </button>
        ) : (
          <button
            id={`edit-btn-${ticket.id}`}
            onClick={() => onEdit(ticket)}
            aria-label={`Edit ticket ${ticket.id}`}
            className="btn-action-edit"
          >
            <i className="ti ti-edit text-xs" aria-hidden="true" />
            Edit
          </button>
        )}
      </span>
    </div>
  );
}
