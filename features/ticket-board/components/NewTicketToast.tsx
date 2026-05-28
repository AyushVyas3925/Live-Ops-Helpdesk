'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { Ticket as TicketType } from '@/shared/types/ticket.types';

interface NewTicketToastProps {
  ticket: TicketType;
  onDismiss: () => void;
}

export default function NewTicketToast({ ticket, onDismiss }: NewTicketToastProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimeRef = useRef<number>(0);
  const remainingTimeRef = useRef<number>(4000);

  const startTimer = useCallback((duration: number) => {
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      setVisible(false);
      dismissTimerRef.current = setTimeout(onDismiss, 300);
    }, duration);
  }, [onDismiss]);

  const handleMouseEnter = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (remainingTimeRef.current > 0) {
      startTimer(remainingTimeRef.current);
    } else {
      setVisible(false);
      dismissTimerRef.current = setTimeout(onDismiss, 300);
    }
  }, [startTimer, onDismiss]);

  const handleManualDismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    setVisible(false);
    dismissTimerRef.current = setTimeout(onDismiss, 300);
  }, [onDismiss]);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    startTimer(4000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, [startTimer]);

  return (
    <div
      role="status"
      aria-live="polite"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`flex items-start gap-3 bg-white border border-gray-200 shadow-lg rounded-lg p-3.5 w-72 transition-all duration-300 pointer-events-auto ${
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
        onClick={handleManualDismiss}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
        aria-label="Dismiss notification"
      >
        <i className="ti ti-x text-xs" />
      </button>
    </div>
  );
}
