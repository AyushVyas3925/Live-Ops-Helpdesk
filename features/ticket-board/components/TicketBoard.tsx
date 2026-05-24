'use client';

import { useState, useMemo } from 'react';
import { useTicketList } from '../hooks/useTicketList';
import { useTicketLock } from '@/features/presence-lock/hooks/useTicketLock';
import TicketRow from './TicketRow';
import NewTicketToast from './NewTicketToast';
import AgentPresenceBar from '@/features/presence-lock/components/AgentPresenceBar';
import TicketEditPanel from './TicketEditPanel';
import type { Ticket, Priority, TicketStatus } from '@/shared/types/ticket.types';

type PriorityFilter = Priority | 'all';
type StatusFilter = TicketStatus | 'all';

export default function TicketBoard() {
  const { tickets, isLoading, newTicketIds } = useTicketList();
  const { locks, connectedAgents, lockTicket, unlockTicket } = useTicketLock();

  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [toastTickets, setToastTickets] = useState<Ticket[]>([]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return tickets.filter(t => {
      const matchesSearch = !q || t.subject.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || t.location.toLowerCase().includes(q);
      const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [tickets, search, priorityFilter, statusFilter]);

  const handleEdit = (ticket: Ticket) => {
    setEditingTicket(ticket);
    lockTicket(ticket.id);
  };

  const handleSave = () => {
    setEditingTicket(null);
  };

  const handleClose = () => {
    setEditingTicket(null);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header Block (Industrial Dashboard Theme) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <i className="ti ti-layout-dashboard text-blue-600" aria-hidden="true"></i>
            RapidDispatch Live Ops
          </h1>
          <p className="text-xs text-gray-600 font-medium mt-0.5">
            {tickets.length} total tickets · {connectedAgents.length} dispatch agents online
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <AgentPresenceBar agents={connectedAgents} />
          
          <button
            id="new-ticket-demo-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm cursor-pointer"
            onClick={() => {
              const demo: Ticket = {
                id: `TK-${1000 + Math.floor(Math.random() * 999)}`,
                subject: `Freight delay: Route ${Math.floor(Math.random() * 900) + 100} delay`,
                priority: (['critical', 'high', 'normal'] as Priority[])[Math.floor(Math.random() * 3)],
                status: 'open',
                agentId: 'demo',
                agentName: 'Auto-dispatch',
                createdAt: new Date().toISOString(),
                description: 'Simulated ticket for system demonstration.',
                location: 'Memphis, TN',
              };
              setToastTickets(prev => [...prev, demo]);
            }}
          >
            <i className="ti ti-plus" aria-hidden="true" />
            Simulate Ticket
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center gap-3 px-6 py-3 bg-gray-50 border-b border-gray-200">
        <div className="relative flex-1 max-w-sm">
          <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" aria-hidden="true" />
          <input
            id="ticket-search"
            type="search"
            placeholder="Search ticket subject, ID, location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs font-medium border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Search tickets"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <i className="ti ti-filter text-gray-600" aria-hidden="true" />
          <select
            id="priority-filter"
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value as PriorityFilter)}
            className="text-xs font-semibold border border-gray-300 rounded px-3 py-1.5 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by priority"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
          </select>
          
          <select
            id="status-filter"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as StatusFilter)}
            className="text-xs font-semibold border border-gray-300 rounded px-3 py-1.5 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by status"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Grid container with horizontal scroll support */}
      <div className="flex-1 flex flex-col min-h-0 overflow-x-auto">
        <div className="min-w-[800px] flex-1 flex flex-col">
          {/* Table Header - Aligned with row borders by using border-l-[4px] border-transparent */}
          <div className="grid grid-cols-[80px_1fr_90px_95px_130px_100px_85px] gap-4 px-6 py-2.5 bg-gray-50 border-b border-gray-200 border-l-[4px] border-transparent id-header-grid sticky top-0 z-10">
            {['Ticket ID', 'Subject / Destination', 'Priority', 'Status', 'Assigned Agent', 'Created', 'Action'].map(col => (
              <span key={col} className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">{col}</span>
            ))}
          </div>

          {/* Rows List */}
          <div
            className="flex-1 overflow-y-auto divide-y divide-gray-200 bg-white"
            role="table"
            aria-label="Support tickets"
          >
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-50 animate-pulse border-l-[4px] border-gray-200 mx-0 px-6 py-3" />
              ))
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-600">
                <i className="ti ti-ticket-off text-3xl mb-2 text-gray-400" aria-hidden="true" />
                <p className="text-sm font-semibold">No active tickets match your filters</p>
                <button
                  onClick={() => { setSearch(''); setPriorityFilter('all'); setStatusFilter('all'); }}
                  className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
                >
                  Clear filters & search
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
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Toast notifications */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50" aria-live="polite">
        {toastTickets.map(t => (
          <NewTicketToast
            key={t.id}
            ticket={t}
            onDismiss={() => setToastTickets(prev => prev.filter(x => x.id !== t.id))}
          />
        ))}
      </div>

      {/* Slide-out Edit panel */}
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

