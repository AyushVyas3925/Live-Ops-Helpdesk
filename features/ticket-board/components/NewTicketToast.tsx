'use client';

import { useEffect, useState } from 'react';
import type { Ticket as TicketType } from '@/shared/types/ticket.types';

interface NewTicketToastProps {
  ticket: TicketType;
  onDismiss: () => void;
}

export default function NewTicketToast({ ticket, onDismiss }: NewTicketToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-start gap-3 bg-white border border-gray-200 shadow-lg rounded-lg p-3.5 w-72 transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
      }`}
    >
      <div className="flex-shrink-0 w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100">
        <i className="ti ti-ticket text-blue-600 text-xs" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-900">New ticket #{ticket.id}</p>
        <p className="text-[11px] text-gray-600 truncate mt-0.5">{ticket.subject}</p>
      </div>
      <button
        onClick={() => { setVisible(false); setTimeout(onDismiss, 300); }}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
        aria-label="Dismiss notification"
      >
        <i className="ti ti-x text-xs" />
      </button>
    </div>
  );
}

