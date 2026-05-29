'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { Ticket } from '@/shared/types/ticket.types';
import SaveCloseControls from '@/features/connection-resilience/components/SaveCloseControls';
import { formatShortTime } from '@/shared/utils/formatTime';
import { PRIORITY_PILL_BORDER, PRIORITY_BORDER } from '@/shared/constants/theme';

interface TicketEditPanelProps {
  ticket:       Ticket;
  onSave:       () => void;
  onClose:      () => void;
  unlockTicket: (ticketId: string) => void;
}


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

  const priStyle = PRIORITY_PILL_BORDER[ticket.priority] ?? PRIORITY_PILL_BORDER.normal;

  if (!mounted) return null;

  return createPortal(
    <aside
      ref={asideRef}
      role="complementary"
      aria-label={`Editing ticket ${ticket.id}`}
      className={`edit-panel-aside ${isClosing ? 'closing' : ''}`}
    >
      <div className="py-4 px-5 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-mono text-[11px] text-gray-500 font-semibold">
            #{ticket.id}
          </span>
          <span className={`inline-flex items-center gap-1 py-[3px] px-2 rounded-full text-[9px] font-bold uppercase tracking-[0.04em] ${priStyle}`}>
            <i className="ti ti-alert-triangle text-[9px]" aria-hidden="true" />
            {ticket.priority}
          </span>
        </div>

        <h2 className="font-bold text-gray-900 text-[15px] leading-[1.35] mb-2.5">
          {ticket.subject}
        </h2>

        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3.5 text-[10px] font-medium text-gray-500">
          <span className="flex items-center gap-1">
            <i className="ti ti-map-pin opacity-70" aria-hidden="true" />
            {ticket.location}
          </span>
          <span className="flex items-center gap-1 font-mono">
            <i className="ti ti-clock opacity-70" aria-hidden="true" />
            {formatShortTime(ticket.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <i className="ti ti-user opacity-70" aria-hidden="true" />
            Assignee: {ticket.agentName}
          </span>
        </div>
      </div>

      <div className="py-3.5 px-5 border-b border-gray-200 bg-white">
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.05em] mb-1.5">
          Cargo details / Issue Description
        </p>
        <p className={`text-xs text-gray-700 leading-relaxed bg-[#F8FAFC] py-3 px-3.5 rounded-md border border-gray-200 ${PRIORITY_BORDER[ticket.priority] ?? 'border-l-[3px] border-l-blue-500'}`}>
          {ticket.description}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5 bg-[#F8FAFC]">
        <div>
          <label
            htmlFor={`notes-${ticket.id}`}
            className="block text-[10px] font-bold text-gray-600 uppercase tracking-[0.05em] mb-1.5"
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
            className="block text-[10px] font-bold text-gray-600 uppercase tracking-[0.05em] mb-1.5"
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

      <div className="py-3.5 px-5 border-t border-gray-200 bg-gray-50 flex justify-end shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
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
