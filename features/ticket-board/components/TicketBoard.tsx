'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { useTicketList } from '../hooks/useTicketList';
import { useTicketLock } from '@/features/presence-lock/hooks/useTicketLock';
import TicketRow from './TicketRow';
import AgentPresenceBar from '@/features/presence-lock/components/AgentPresenceBar';
import TicketEditPanel from './TicketEditPanel';
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
  const { tickets, isLoading, newTicketIds, addTicket } = useTicketList();
  const { locks, connectedAgents, lockTicket, unlockTicket } = useTicketLock();

  const [search, setSearch]               = useState('');
  const [priorityFilter, setPriFilter]    = useState<PriorityFilter>('all');
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const simCounterRef = useRef(2001);
  const simIdxRef     = useRef(0);

  /* ── Derived stats ── */
  const criticalCount = tickets.filter(t => t.priority === 'critical').length;
  const openCount     = tickets.filter(t => t.status === 'open').length;
  const inProgCount   = tickets.filter(t => t.status === 'in_progress').length;

  /* ── Filtered list ── */
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

  /* ── Edit / lock handlers ── */
  const handleEdit = useCallback((ticket: Ticket) => {
    setEditingTicket(ticket);
    lockTicket(ticket.id);
  }, [lockTicket]);

  const handleSave  = useCallback(() => setEditingTicket(null), []);
  const handleClose = useCallback(() => setEditingTicket(null), []);

  /* ── Simulate demo ticket (client-side injection) ── */
  const simulateTicket = useCallback(() => {
    const counter = simCounterRef.current++;
    const idx     = simIdxRef.current++;
    const demo: Ticket = {
      id:          `TK-${counter}`,
      subject:     DEMO_SUBJECTS[idx % DEMO_SUBJECTS.length],
      priority:    (['critical', 'high', 'normal'] as Priority[])[Math.floor(Math.random() * 3)],
      status:      'open',
      agentId:     'demo',
      agentName:   DEMO_AGENTS[Math.floor(Math.random() * DEMO_AGENTS.length)],
      createdAt:   new Date().toISOString(),
      description: 'Simulated ticket for system demonstration.',
      location:    'Auto-dispatch',
    };
    addTicket(demo);
  }, [addTicket]);

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#F8FAFC' }}>

      {/* ════════════════════════ TOP BAR ════════════════════════ */}
      <div
        className="flex items-center justify-between px-5 border-b"
        style={{ background: '#FFFFFF', borderColor: '#E5E7EB', padding: '14px 20px' }}
      >
        <div className="flex flex-col gap-0.5">
          <span className="font-bold tracking-tight" style={{ fontSize: 17, color: '#111827' }}>
            RapidDispatch Live Ops
          </span>
          <span className="flex items-center gap-1.5 text-[12px]" style={{ color: '#6B7280' }}>
            <span className="live-dot" aria-hidden="true" />
            <span>{tickets.length} active tickets</span>
            <span>&nbsp;·&nbsp;</span>
            <span>{connectedAgents.length} dispatch agents online</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-medium" style={{ color: '#6B7280' }}>Online</span>
          <AgentPresenceBar agents={connectedAgents} />
        </div>
      </div>

      {/* ════════════════════════ STATS ROW ════════════════════════ */}
      <div className="stats-row" style={{ borderBottom: '1px solid #E5E7EB' }}>
        <div className="stat-cell">
          <span className="text-[22px] font-bold tabular-nums" style={{ color: '#DC2626' }}>{criticalCount}</span>
          <span className="text-[11px] uppercase tracking-wider" style={{ color: '#6B7280' }}>Critical</span>
        </div>
        <div className="stat-cell">
          <span className="text-[22px] font-bold tabular-nums" style={{ color: '#D97706' }}>{openCount}</span>
          <span className="text-[11px] uppercase tracking-wider" style={{ color: '#6B7280' }}>Open</span>
        </div>
        <div className="stat-cell">
          <span className="text-[22px] font-bold tabular-nums" style={{ color: '#2563EB' }}>{inProgCount}</span>
          <span className="text-[11px] uppercase tracking-wider" style={{ color: '#6B7280' }}>In Progress</span>
        </div>
        <div className="stat-cell">
          <span className="text-[22px] font-bold tabular-nums" style={{ color: '#16A34A' }}>{connectedAgents.length}</span>
          <span className="text-[11px] uppercase tracking-wider" style={{ color: '#6B7280' }}>Agents Active</span>
        </div>
      </div>

      {/* ════════════════════════ TOOLBAR ════════════════════════ */}
      <div
        className="flex items-center gap-2.5 flex-wrap"
        style={{ background: '#FFFFFF', borderBottom: '1px solid #E5E7EB', padding: '12px 20px' }}
      >
        {/* Search */}
        <div
          className="flex items-center gap-2 flex-1 h-9 px-3 rounded-lg"
          style={{ minWidth: 180, background: '#FFFFFF', border: '1px solid #E5E7EB' }}
        >
          <i className="ti ti-search" style={{ color: '#9CA3AF', fontSize: 15 }} aria-hidden="true" />
          <input
            id="ticket-search"
            type="search"
            placeholder="Search ticket subject, ID, location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontSize: 13, color: '#111827',
            }}
            aria-label="Search tickets"
          />
        </div>

        {/* Filter buttons */}
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

        {/* Simulate Ticket */}
        <button
          id="new-ticket-demo-btn"
          onClick={simulateTicket}
          className="flex items-center gap-1.5 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors ml-auto"
          style={{ height: 36, padding: '0 14px', background: '#2563EB', border: 'none' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#1D4ED8')}
          onMouseLeave={e => (e.currentTarget.style.background = '#2563EB')}
          onMouseDown={e  => (e.currentTarget.style.transform  = 'scale(0.97)')}
          onMouseUp={e    => (e.currentTarget.style.transform  = '')}
        >
          <i className="ti ti-plus" style={{ fontSize: 14 }} aria-hidden="true" />
          Simulate Ticket
        </button>
      </div>

      {/* ════════════════════════ COLUMN HEADERS ════════════════════════ */}
      <div
        className="grid items-center sticky top-0 z-10"
        style={{
          gridTemplateColumns: '90px 1fr 100px 110px 130px 100px 90px',
          gap: 0,
          padding: '9px 16px',
          background: '#F9FAFB',
          borderBottom: '1px solid #E5E7EB',
          borderLeft: '3px solid transparent',
        }}
      >
        {['Ticket ID', 'Subject / Destination', 'Priority', 'Status', 'Assigned Agent', 'Created', 'Action'].map(col => (
          <span key={col} style={{ fontSize: 10, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {col}
          </span>
        ))}
      </div>

      {/* ════════════════════════ TICKET ROWS ════════════════════════ */}
      <div
        className="flex-1 overflow-y-auto overflow-x-auto"
        role="table"
        aria-label="Support tickets"
        style={{ background: '#F8FAFC' }}
      >
        <div style={{ minWidth: 780 }}>
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 52,
                  background: i % 2 === 0 ? '#F9FAFB' : '#FFFFFF',
                  borderBottom: '1px solid #F1F5F9',
                  borderLeft: '3px solid #E2E8F0',
                  animation: 'pulse 1.5s infinite',
                }}
              />
            ))
          ) : filtered.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', color: '#6B7280' }}>
              <i className="ti ti-ticket-off" style={{ fontSize: 32, color: '#9CA3AF', marginBottom: 8 }} aria-hidden="true" />
              <p style={{ fontSize: 14, fontWeight: 600 }}>No active tickets match your filters</p>
              <button
                onClick={() => { setSearch(''); setPriFilter('all'); }}
                style={{ marginTop: 8, fontSize: 12, fontWeight: 600, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer' }}
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

      {/* ════════════════════════ EDIT PANEL ════════════════════════ */}
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
