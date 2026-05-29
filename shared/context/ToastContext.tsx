'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import NewTicketToast from '@/features/ticket-board/components/NewTicketToast';
import type { Ticket } from '@/shared/types/ticket.types';

export interface ToastItem {
  id: string;
  ticket: Ticket;
  duration?: number;
}

interface ToastState {
  visible: ToastItem[];
  queue: ToastItem[];
}

interface ToastContextType {
  toast: (ticket: Ticket, duration?: number) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ToastState>({ visible: [], queue: [] });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let active = true;
    requestAnimationFrame(() => {
      if (active) setMounted(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const toast = useCallback((ticket: Ticket, duration?: number) => {
    const newToast: ToastItem = {
      id: ticket.id,
      ticket,
      duration,
    };

    setState(prev => {
      // Prevent duplicate notifications for the same ticket ID
      if (prev.visible.some(t => t.id === ticket.id) || prev.queue.some(t => t.id === ticket.id)) {
        return prev;
      }

      if (prev.visible.length < 3) {
        return {
          visible: [...prev.visible, newToast],
          queue: prev.queue,
        };
      } else {
        return {
          visible: prev.visible,
          queue: [...prev.queue, newToast],
        };
      }
    });
  }, []);

  const dismiss = useCallback((id: string) => {
    setState(prev => {
      const filteredVisible = prev.visible.filter(t => t.id !== id);

      if (prev.queue.length > 0 && filteredVisible.length < 3) {
        const [nextToast, ...remainingQueue] = prev.queue;
        return {
          visible: [...filteredVisible, nextToast],
          queue: remainingQueue,
        };
      }

      return {
        visible: filteredVisible,
        queue: prev.queue,
      };
    });
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {mounted && createPortal(
        <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 pointer-events-none">
          {state.visible.map(toastItem => (
            <NewTicketToast
              key={toastItem.id}
              ticket={toastItem.ticket}
              onDismiss={() => dismiss(toastItem.id)}
            />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
