'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { Ticket } from '@/shared/types/ticket.types';
import SaveCloseControls from '@/features/connection-resilience/components/SaveCloseControls';

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

const PRIORITY_BORDER: Record<string, string> = {
  critical: '3px solid #EF4444',
  high:     '3px solid #F59E0B',
  normal:   '3px solid #3B82F6',
};

export default function TicketEditPanel({ ticket, onSave, onClose, unlockTicket }: TicketEditPanelProps) {
  const [notes,      setNotes]      = useState('');
  const [resolution, setResolution] = useState('');
  const [isSaving,   setIsSaving]   = useState(false);
  const [isClosing,  setIsClosing]  = useState(false);
  const [mounted,    setMounted]    = useState(false);

  const notesRef = useRef<HTMLTextAreaElement>(null);
  const asideRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const handleCloseTransition = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    if (!mounted) return;

    if (notesRef.current) {
      notesRef.current.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        unlockTicket(ticket.id);
        handleCloseTransition();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mounted, ticket.id, unlockTicket, handleCloseTransition]);

  useEffect(() => {
    if (!mounted) return;

    const focusableElements = asideRef.current?.querySelectorAll(
      'input:not([disabled]), textarea:not([disabled]), button:not([disabled])'
    );
    if (!focusableElements || focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleTabKey);
    return () => window.removeEventListener('keydown', handleTabKey);
  }, [mounted]);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(res => setTimeout(res, 600));
    setIsSaving(false);
    setIsClosing(true);
    setTimeout(() => {
      onSave();
    }, 300);
  };

  const priStyle = PRIORITY_PILL[ticket.priority] ?? PRIORITY_PILL.normal;

  if (!mounted) return null;

  return createPortal(
    <aside
      ref={asideRef}
      role="complementary"
      aria-label={`Editing ticket ${ticket.id}`}
      className={`edit-panel-aside ${isClosing ? 'closing' : ''}`}
    >
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #E5E7EB',
          background: '#F9FAFB',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, color: '#6B7280', fontWeight: 600 }}>
            #{ticket.id}
          </span>
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '3px 8px', borderRadius: 999,
              fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
              ...priStyle,
            }}
          >
            <i className="ti ti-alert-triangle" style={{ fontSize: 9 }} aria-hidden="true" />
            {ticket.priority}
          </span>
        </div>

        <h2 style={{ fontWeight: 700, color: '#111827', fontSize: 15, lineHeight: 1.35, marginBottom: 10 }}>
          {ticket.subject}
        </h2>

        <div
          style={{
            display: 'flex', flexWrap: 'wrap', alignItems: 'center',
            gap: '6px 14px',
            fontSize: 10, fontWeight: 500, color: '#6B7280',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <i className="ti ti-map-pin" style={{ opacity: 0.7 }} aria-hidden="true" />
            {ticket.location}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'ui-monospace, monospace' }}>
            <i className="ti ti-clock" style={{ opacity: 0.7 }} aria-hidden="true" />
            {formatShortTime(ticket.createdAt)}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <i className="ti ti-user" style={{ opacity: 0.7 }} aria-hidden="true" />
            Assignee: {ticket.agentName}
          </span>
        </div>
      </div>

      <div style={{ padding: '14px 20px', borderBottom: '1px solid #E5E7EB', background: '#FFFFFF' }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
          Cargo details / Issue Description
        </p>
        <p
          style={{
            fontSize: 12, color: '#374151', lineHeight: 1.6,
            background: '#F8FAFC', padding: '12px 14px',
            borderRadius: 6, 
            border: '1px solid #E2E8F0',
            borderLeft: PRIORITY_BORDER[ticket.priority] ?? '3px solid #3B82F6',
          }}
        >
          {ticket.description}
        </p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 20, background: '#F8FAFC' }}>
        <div>
          <label
            htmlFor={`notes-${ticket.id}`}
            style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}
          >
            Agent Operational Notes
          </label>
          <textarea
            id={`notes-${ticket.id}`}
            ref={notesRef}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={4}
            placeholder="Add internal cargo dispatch logs and notes..."
            className="panel-textarea"
          />
        </div>

        <div>
          <label
            htmlFor={`resolution-${ticket.id}`}
            style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}
          >
            Resolution Protocol
          </label>
          <textarea
            id={`resolution-${ticket.id}`}
            value={resolution}
            onChange={e => setResolution(e.target.value)}
            rows={5}
            placeholder="Detail the actions taken to resolve the dispatch issue..."
            className="panel-textarea"
          />
        </div>
      </div>

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
          onClose={handleCloseTransition}
          isSaving={isSaving}
        />
      </div>
    </aside>,
    document.body
  );
}
