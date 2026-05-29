'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useTicketList } from '../hooks/useTicketList';
import { useTicketLock } from '@/features/presence-lock/hooks/useTicketLock';
import TicketRow from './TicketRow';
import AgentPresenceBar from '@/features/presence-lock/components/AgentPresenceBar';
import TicketEditPanel from './TicketEditPanel';
import { useSocket } from '@/shared/context/SocketContext';
import { useToast } from '@/shared/context/ToastContext';
import type { Ticket, Priority } from '@/shared/types/ticket.types';

type PriorityFilter = Priority | 'all';

const DEMO_SUBJECTS = [
  'Engine overheating — Unit RD-301, I-40 near Flagstaff AZ',
  'Load shift reported — Unit RD-522, Highway 287 TX',
  'Client unreachable — delivery window missed, Seattle WA',
  'Hazmat spill alert — Unit RD-119, I-10 Louisiana',
  'Bridge weight violation — Unit RD-203, Mississippi',
];
const DEMO_AGENTS = ['Marcus T.', 'Priya S.', 'Jordan K.', 'Aisha R.'];

export default function TicketBoard() {
  const { tickets, isLoading, newTicketIds } = useTicketList();
  const { locks, connectedAgents, lockTicket, unlockTicket } = useTicketLock();

  const [search, setSearch]               = useState('');
  const [priorityFilter, setPriFilter]    = useState<PriorityFilter>('all');
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const simIdxRef     = useRef(0);

  const socket = useSocket();
  const { toast } = useToast();

  useEffect(() => {
    const handleNewTicket = (ticket: Ticket) => {
      toast(ticket);
    };
    socket.on('new_ticket', handleNewTicket);
    return () => {
      socket.off('new_ticket', handleNewTicket);
    };
  }, [socket, toast]);


  const criticalCount = tickets.filter(t => t.priority === 'critical').length;
  const openCount     = tickets.filter(t => t.status === 'open').length;
  const inProgCount   = tickets.filter(t => t.status === 'in_progress').length;


  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return tickets.filter(t => {
      const matchSearch = !q
        || t.subject.toLowerCase().includes(q)
        || t.id.toLowerCase().includes(q)
        || t.location.toLowerCase().includes(q);
      const matchPri = priorityFilter === 'all' || t.priority === priorityFilter;
      return matchSearch && matchPri;
    });
  }, [tickets, search, priorityFilter]);


  const handleEdit = useCallback((ticket: Ticket) => {
    if (editingTicket && editingTicket.id !== ticket.id) {
      unlockTicket(editingTicket.id);
    }
    setEditingTicket(ticket);
    lockTicket(ticket.id);
  }, [editingTicket, lockTicket, unlockTicket]);

  const handleSave  = useCallback(() => setEditingTicket(null), []);
  const handleClose = useCallback(() => setEditingTicket(null), []);


  const simulateTicket = useCallback(() => {
    const idx     = simIdxRef.current++;
    const demo = {
      subject:     DEMO_SUBJECTS[idx % DEMO_SUBJECTS.length],
      priority:    (['critical', 'high', 'normal'] as Priority[])[Math.floor(Math.random() * 3)],
      status:      'open',
      agentId:     'demo',
      agentName:   DEMO_AGENTS[Math.floor(Math.random() * DEMO_AGENTS.length)],
      description: 'Simulated ticket for system demonstration.',
      location:    'Auto-dispatch',
    };
    socket.emit('simulate_ticket', demo);
  }, [socket]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F8FAFC]">


      <div className="flex items-center justify-between px-5 border-b bg-white border-gray-200 py-[14px]">
        <div className="flex flex-col gap-0.5">
          <span className="font-bold tracking-tight text-[17px] text-gray-900">
            RapidDispatch Live Ops
          </span>
          <span className="flex items-center gap-1.5 text-[12px] text-gray-500">
            <span className="live-dot" aria-hidden="true" />
            <span>{tickets.length} active tickets</span>
            <span>&nbsp;·&nbsp;</span>
            <span>{connectedAgents.length} dispatch agents online</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-medium text-gray-500">Online</span>
          <AgentPresenceBar agents={connectedAgents} />
        </div>
      </div>


      <div className="stats-row">
        <div className="stat-cell stat-cell-critical">
          <span className="text-[22px] font-bold tabular-nums text-red-600">{criticalCount}</span>
          <span className="text-[11px] uppercase tracking-wider text-gray-500">Critical</span>
        </div>
        <div className="stat-cell stat-cell-open">
          <span className="text-[22px] font-bold tabular-nums text-amber-600">{openCount}</span>
          <span className="text-[11px] uppercase tracking-wider text-gray-500">Open</span>
        </div>
        <div className="stat-cell stat-cell-in-progress">
          <span className="text-[22px] font-bold tabular-nums text-blue-600">{inProgCount}</span>
          <span className="text-[11px] uppercase tracking-wider text-gray-500">In Progress</span>
        </div>
        <div className="stat-cell stat-cell-active">
          <span className="text-[22px] font-bold tabular-nums text-green-600">{connectedAgents.length}</span>
          <span className="text-[11px] uppercase tracking-wider text-gray-500">Agents Active</span>
        </div>
      </div>


      <div className="flex items-center gap-2.5 flex-wrap bg-white border-b border-gray-200 py-3 px-5">
        <div className="search-container">
          <i className="ti ti-search text-gray-400 text-[15px]" aria-hidden="true" />
          <input
            id="ticket-search"
            type="search"
            placeholder="Search ticket subject, ID, location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 border-none outline-none bg-transparent text-[13px] text-gray-900"
            aria-label="Search tickets"
          />
        </div>

        {/* Filters */}
        {(['all', 'critical', 'high'] as const).map(f => (
          <button
            key={f}
            id={`f-${f}`}
            className={`filter-btn${priorityFilter === f ? ' active' : ''}`}
            onClick={() => setPriFilter(f)}
            aria-pressed={priorityFilter === f}
          >
            {f === 'all' ? 'All Priorities' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}

        <button
          id="new-ticket-demo-btn"
          onClick={simulateTicket}
          className="btn-simulate-ticket ml-auto"
        >
          <i className="ti ti-plus text-sm" aria-hidden="true" />
          Simulate Ticket
        </button>
      </div>


      <div className="flex-1 overflow-y-auto overflow-x-auto bg-[#F8FAFC]" role="table" aria-label="Support tickets">
        <div className="min-w-[880px]">
          <div
            className="grid items-center sticky top-0 z-10 grid-cols-[80px_1fr_120px_120px_150px_100px_100px] gap-0 py-2.5 px-4 bg-gray-50 border-b border-gray-200 border-l-3 border-l-transparent"
          >
            {['Ticket ID', 'Subject / Destination', 'Priority', 'Status', 'Assigned Agent', 'Created', 'Action'].map(col => (
              <span key={col} className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.06em]">
                {col}
              </span>
            ))}
          </div>
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={`h-[52px] ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} border-b border-slate-100 border-l-3 border-slate-200 animate-pulse`}
              />
            ))
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <i className="ti ti-ticket-off text-[32px] text-gray-400 mb-2" aria-hidden="true" />
              <p className="text-sm font-semibold">No active tickets match your filters</p>
              <button
                onClick={() => { setSearch(''); setPriFilter('all'); }}
                className="mt-2 text-xs font-semibold text-blue-600 bg-none border-none cursor-pointer"
              >
                Clear filters &amp; search
              </button>
            </div>
          ) : (
            filtered.map(ticket => (
              <TicketRow
                key={ticket.id}
                ticket={ticket}
                lock={locks.get(ticket.id) ?? null}
                isNew={newTicketIds.has(ticket.id)}
                onEdit={handleEdit}
                onUnlock={unlockTicket}
              />
            ))
          )}
        </div>
      </div>


      {editingTicket && (
        <TicketEditPanel
          ticket={editingTicket}
          onSave={handleSave}
          onClose={handleClose}
          unlockTicket={unlockTicket}
        />
      )}

    </div>
  );
}
