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

/* ── Priority pill styles (light theme) ── */
const PRIORITY_PILL: Record<string, { background: string; color: string }> = {
  critical: { background: '#FEE2E2', color: '#991B1B' },
  high:     { background: '#FEF3C7', color: '#92400E' },
  normal:   { background: '#EFF6FF', color: '#1D4ED8' },
};

/* ── Status pill styles (light theme) ── */
const STATUS_PILL: Record<string, { background: string; color: string }> = {
  open:        { background: '#DCFCE7', color: '#166534' },
  in_progress: { background: '#EFF6FF', color: '#1D4ED8' },
  closed:      { background: '#F3F4F6', color: '#6B7280' },
};

const STATUS_LABEL: Record<string, string> = {
  open: 'Open', in_progress: 'In Progress', closed: 'Closed',
};

/* ── Agent mini-avatar colors (same palette as reference HTML) ── */
const AGENT_BG: Record<string, string> = {
  'Marcus T.':  '#1e3a8a',
  'Priya S.':   '#4c1d95',
  'Jordan K.':  '#78350f',
  'Aisha R.':   '#134e4a',
  'Devon L.':   '#1e3a5f',
  'Camille W.': '#3b1764',
  'Ravi P.':    '#7c2d12',
  'Nadia O.':   '#14532d',
  'Tyler B.':   '#1e1b4b',
  'Simone F.':  '#831843',
};
function agentBg(name: string) {
  return AGENT_BG[name] ?? '#374151';
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

  /* ── Row class (3 states) ── */
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
      className={rowClass}
      onClick={handleRowClick}
      role="row"
      aria-label={`Ticket ${ticket.id}: ${ticket.subject}`}
      style={{
        display: 'grid',
        gridTemplateColumns: '70px 2.2fr 1.1fr 1.1fr 1.5fr 1fr 1fr',
        gap: '16px',
        padding: '13px 16px',
        borderBottom: '1px solid #F1F5F9',
        alignItems: 'center',
        cursor: isLockedByOther ? 'not-allowed' : 'pointer',
        position: 'relative',
      }}
    >
      {/* Ticket ID */}
      <span
        style={{
          fontFamily: 'ui-monospace, monospace',
          fontSize: 12,
          color: '#6B7280',
          fontWeight: 500,
        }}
      >
        #{ticket.id}
      </span>

      {/* Subject + lock badge */}
      <div style={{ minWidth: 0, paddingRight: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: isLockedByOther ? '#6B7280' : '#F3F4F6' === '#F3F4F6' ? '#111827' : '#111827',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {ticket.subject}
          </span>

          {/* Lock badge */}
          {isLockedByOther && (
            <span
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 10, fontWeight: 600,
                color: '#991B1B', background: '#FEE2E2',
                padding: '2px 7px', borderRadius: 999,
                whiteSpace: 'nowrap', flexShrink: 0,
              }}
              aria-label={`Locked by ${lock!.agentName}`}
            >
              <i className="ti ti-lock" style={{ fontSize: 10 }} aria-hidden="true" />
              Locked by {lock!.agentName}
            </span>
          )}
          {isLockedByMe && (
            <span
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 10, fontWeight: 600,
                color: '#1D4ED8', background: '#EFF6FF',
                padding: '2px 7px', borderRadius: 999,
                whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              <i className="ti ti-lock" style={{ fontSize: 10 }} aria-hidden="true" />
              You
            </span>
          )}
        </div>
        <p style={{ fontSize: 11, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
          <i className="ti ti-map-pin" />
          {ticket.location}
        </p>
      </div>

      {/* Priority pill */}
      <div>
        <span
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 9px', borderRadius: 999,
            fontSize: 11, fontWeight: 700, letterSpacing: '0.03em',
            whiteSpace: 'nowrap',
            ...priStyle,
          }}
        >
          {ticket.priority === 'critical' && <i className="ti ti-alert-triangle" style={{ fontSize: 11 }} aria-hidden="true" />}
          {ticket.priority === 'high'     && <i className="ti ti-arrow-up"       style={{ fontSize: 11 }} aria-hidden="true" />}
          {ticket.priority.toUpperCase()}
        </span>
      </div>

      {/* Status pill */}
      <div>
        <span
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 9px', borderRadius: 999,
            fontSize: 11, fontWeight: 700,
            whiteSpace: 'nowrap',
            ...stStyle,
          }}
        >
          {ticket.status === 'open'        && <i className="ti ti-circle"  style={{ fontSize: 10 }} aria-hidden="true" />}
          {ticket.status === 'in_progress' && <i className="ti ti-loader"  style={{ fontSize: 10 }} aria-hidden="true" />}
          {STATUS_LABEL[ticket.status]}
        </span>
      </div>

      {/* Agent cell */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: isLockedByOther ? '#9CA3AF' : '#374151' }}>
        <span
          style={{
            width: 26, height: 26, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, flexShrink: 0,
            background: agentBg(ticket.agentName), color: '#fff',
          }}
        >
          {getInitials(ticket.agentName)}
        </span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {ticket.agentName}
        </span>
      </div>

      {/* Created time */}
      <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, color: '#9CA3AF', whiteSpace: 'nowrap' }}>
        {formatShortTime(ticket.createdAt)}
      </span>

      {/* Action button — 3 states */}
      <span onClick={e => e.stopPropagation()}>
        {isLockedByOther ? (
          /* Locked by someone else */
          <button
            id={`edit-btn-${ticket.id}`}
            disabled
            aria-disabled="true"
            aria-label={`Ticket ${ticket.id} is locked by ${lock?.agentName}`}
            className="btn-action-locked"
          >
            <i className="ti ti-lock" style={{ fontSize: 12 }} aria-hidden="true" />
            Locked
          </button>
        ) : isLockedByMe ? (
          /* Locked by me — show Release */
          <button
            id={`edit-btn-${ticket.id}`}
            onClick={() => onUnlock(ticket.id)}
            aria-label={`Release lock on ticket ${ticket.id}`}
            className="btn-action-release"
          >
            <i className="ti ti-lock-open" style={{ fontSize: 12 }} aria-hidden="true" />
            Release
          </button>
        ) : (
          /* Unlocked — show Edit */
          <button
            id={`edit-btn-${ticket.id}`}
            onClick={() => onEdit(ticket)}
            aria-label={`Edit ticket ${ticket.id}`}
            className="btn-action-edit"
          >
            <i className="ti ti-edit" style={{ fontSize: 12 }} aria-hidden="true" />
            Edit
          </button>
        )}
      </span>
    </div>
  );
}
