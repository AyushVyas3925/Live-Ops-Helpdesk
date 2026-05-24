'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { Ticket } from '@/shared/types/ticket.types';
import SaveCloseControls from '@/features/connection-resilience/components/SaveCloseControls';

interface TicketEditPanelProps {
  ticket:       Ticket;
  onSave:       () => void;
  onClose:      () => void;
  unlockTicket: (ticketId: string) => void;
}

const PRIORITY_PILL: Record<string, { background: string; color: string; border: string }> = {
  critical: { background: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA' },
  high:     { background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' },
  normal:   { background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' },
};

export default function TicketEditPanel({ ticket, onSave, onClose, unlockTicket }: TicketEditPanelProps) {
  const [notes,      setNotes]      = useState('');
  const [resolution, setResolution] = useState('');
  const [isSaving,   setIsSaving]   = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(res => setTimeout(res, 600));
    setIsSaving(false);
    onSave();
  };

  const priStyle = PRIORITY_PILL[ticket.priority] ?? PRIORITY_PILL.normal;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => { unlockTicket(ticket.id); onClose(); }}
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 30,
          transition: 'opacity 0.2s',
        }}
      />

      {/* Side Panel */}
      <aside
        role="complementary"
        aria-label={`Editing ticket ${ticket.id}`}
        style={{
          position: 'fixed', right: 0, top: 0,
          height: '100%', width: 480,
          background: '#FFFFFF',
          borderLeft: '1px solid #E5E7EB',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          zIndex: 40,
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Panel Header */}
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: '1px solid #E5E7EB',
            background: '#F9FAFB',
          }}
        >
          <div>
            <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, color: '#6B7280', fontWeight: 500 }}>
              #{ticket.id}
            </span>
            <h2 style={{ fontWeight: 700, color: '#111827', fontSize: 14, lineHeight: 1.3, marginTop: 2, paddingRight: 16 }}>
              {ticket.subject}
            </h2>
          </div>
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '3px 10px', borderRadius: 999,
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
              ...priStyle,
            }}
          >
            <i className="ti ti-alert-triangle" style={{ fontSize: 10 }} aria-hidden="true" />
            {ticket.priority}
          </span>
        </div>

        {/* Metadata row */}
        <div
          style={{
            display: 'flex', flexWrap: 'wrap', alignItems: 'center',
            gap: '6px 16px', padding: '10px 20px',
            borderBottom: '1px solid #E5E7EB',
            background: '#FFFFFF',
            fontSize: 10, fontWeight: 500, color: '#6B7280',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <i className="ti ti-map-pin" aria-hidden="true" />
            {ticket.location}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'ui-monospace, monospace', fontSize: 9 }}>
            <i className="ti ti-clock" aria-hidden="true" />
            {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <i className="ti ti-user" aria-hidden="true" />
            Assignee: {ticket.agentName}
          </span>
        </div>

        {/* Description */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #E5E7EB', background: '#FFFFFF' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
            Cargo details / Issue Description
          </p>
          <p
            style={{
              fontSize: 12, color: '#4B5563', lineHeight: 1.6,
              background: '#F9FAFB', padding: '10px 12px',
              borderRadius: 6, border: '1px solid #E5E7EB',
            }}
          >
            {ticket.description}
          </p>
        </div>

        {/* Form */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16, background: '#FFFFFF' }}>
          <div>
            <label
              htmlFor={`notes-${ticket.id}`}
              style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}
            >
              Agent Operational Notes
            </label>
            <textarea
              id={`notes-${ticket.id}`}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={4}
              placeholder="Add internal cargo dispatch logs and notes..."
              style={{
                width: '100%', resize: 'none',
                fontSize: 12, fontWeight: 500,
                border: '1px solid #D1D5DB', borderRadius: 6,
                background: '#FFFFFF', color: '#111827',
                padding: '8px 12px',
                outline: 'none',
                transition: 'border-color 0.15s',
                boxSizing: 'border-box',
              }}
              onFocus={e  => (e.currentTarget.style.borderColor = '#3B82F6')}
              onBlur={e   => (e.currentTarget.style.borderColor = '#D1D5DB')}
            />
          </div>

          <div>
            <label
              htmlFor={`resolution-${ticket.id}`}
              style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}
            >
              Resolution Protocol
            </label>
            <textarea
              id={`resolution-${ticket.id}`}
              value={resolution}
              onChange={e => setResolution(e.target.value)}
              rows={5}
              placeholder="Detail the actions taken to resolve the dispatch issue..."
              style={{
                width: '100%', resize: 'none',
                fontSize: 12, fontWeight: 500,
                border: '1px solid #D1D5DB', borderRadius: 6,
                background: '#FFFFFF', color: '#111827',
                padding: '8px 12px',
                outline: 'none',
                transition: 'border-color 0.15s',
                boxSizing: 'border-box',
              }}
              onFocus={e  => (e.currentTarget.style.borderColor = '#3B82F6')}
              onBlur={e   => (e.currentTarget.style.borderColor = '#D1D5DB')}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid #E5E7EB',
            background: '#F9FAFB',
            display: 'flex',
            justifyContent: 'flex-end',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.04)',
          }}
        >
          <SaveCloseControls
            ticketId={ticket.id}
            onSave={handleSave}
            onClose={onClose}
            isSaving={isSaving}
          />
        </div>
      </aside>
    </>
  );
}
