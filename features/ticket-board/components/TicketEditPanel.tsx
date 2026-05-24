'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { Ticket } from '@/shared/types/ticket.types';
import SaveCloseControls from '@/features/connection-resilience/components/SaveCloseControls';

interface TicketEditPanelProps {
  ticket: Ticket;
  onSave: () => void;
  onClose: () => void;
  unlockTicket: (ticketId: string) => void;
}

const PRIORITY_COLORS = {
  critical: 'bg-[#FCEBEB] text-[#A32D2D] border border-red-200/60',
  high: 'bg-[#FAEEDA] text-[#854F0B] border border-amber-200/60',
  normal: 'bg-[#E6F1FB] text-[#0C447C] border border-blue-200/60',
} as const;

export default function TicketEditPanel({ ticket, onSave, onClose, unlockTicket }: TicketEditPanelProps) {
  const [notes, setNotes] = useState('');
  const [resolution, setResolution] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save round-trip
    await new Promise(res => setTimeout(res, 600));
    setIsSaving(false);
    onSave();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-30 transition-opacity"
        onClick={() => { unlockTicket(ticket.id); onClose(); }}
        aria-hidden="true"
      />

      {/* Side Panel (Industrial Card Theme) */}
      <aside
        className="fixed right-0 top-0 h-full w-[480px] bg-white border-l border-gray-200 shadow-2xl z-45 flex flex-col transition-all duration-200"
        role="complementary"
        aria-label={`Editing ticket ${ticket.id}`}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <span className="font-[family-name:var(--font-mono)] text-[11px] text-gray-600 font-medium">
              #{ticket.id}
            </span>
            <h2 className="font-bold text-gray-900 text-sm leading-tight mt-0.5 pr-4">
              {ticket.subject}
            </h2>
          </div>
          
          <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${PRIORITY_COLORS[ticket.priority]}`}>
            <i className="ti ti-alert-triangle text-[10px]" aria-hidden="true" />
            {ticket.priority}
          </span>
        </div>

        {/* Operational Metadata */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-5 py-3 border-b border-gray-200 text-[10px] font-medium text-gray-600 bg-white">
          <span className="flex items-center gap-1">
            <i className="ti ti-map-pin" aria-hidden="true" />
            {ticket.location}
          </span>
          <span className="flex items-center gap-1 font-[family-name:var(--font-mono)] text-[9px]">
            <i className="ti ti-clock" aria-hidden="true" />
            {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
          </span>
          <span className="flex items-center gap-1">
            <i className="ti ti-user" aria-hidden="true" />
            Assignee: {ticket.agentName}
          </span>
        </div>

        {/* Cargo / Ticket Details */}
        <div className="px-5 py-4 border-b border-gray-200 bg-white">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Cargo details / Issue Description</p>
          <p className="text-xs text-gray-600 leading-relaxed font-medium bg-gray-50 p-3 rounded border border-gray-200">
            {ticket.description}
          </p>
        </div>

        {/* Agent Operational Logs Form */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4 bg-white">
          <div>
            <label htmlFor={`notes-${ticket.id}`} className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Agent Operational Notes
            </label>
            <textarea
              id={`notes-${ticket.id}`}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={4}
              placeholder="Add internal cargo dispatch logs and notes..."
              className="w-full text-xs font-semibold border border-gray-300 rounded bg-white text-gray-900 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          
          <div>
            <label htmlFor={`resolution-${ticket.id}`} className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Resolution Protocol
            </label>
            <textarea
              id={`resolution-${ticket.id}`}
              value={resolution}
              onChange={e => setResolution(e.target.value)}
              rows={5}
              placeholder="Detail the actions taken to resolve the dispatch issue..."
              className="w-full text-xs font-semibold border border-gray-300 rounded bg-white text-gray-900 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Footer controls */}
        <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 flex justify-end shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
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

