# Live Ops Helpdesk — Frontend Build Prompt

---

## Project Context

Build a **production-grade Real-Time Helpdesk Dashboard** for RapidDispatch Freight & Logistics.
50 support agents use this simultaneously. A single UI mistake = corrupted ticket, angry client, lost freight.
This is a **mission-critical operations screen** — not a marketing page.

---

## Design Direction

**Aesthetic**: Industrial / Utilitarian Operations Dashboard
- Background: `transparent` — the app shell provides the bg. All cards and panels use `bg-white` with subtle `shadow-sm` borders.
- Color language is **semantic and strict** — colors carry meaning, not decoration:
  - `BLUE` → Active / In Progress / Informational states
  - `GREEN` → Available / Unlocked / Connected / Success
  - `RED` → Locked / Disconnected / Critical / Danger
  - `GRAY` → Disabled / Locked-by-others row background
  - `AMBER` → Warning / Reconnecting
- Typography: Large, bold, high-contrast. Numbers and status must be readable **from 2 meters away** on a wall monitor.
- Density: Medium. No wasted space but never cramped. Each ticket row must show all key info at a glance.
- Motion: Purposeful only — slide-in for new tickets, instant color transitions for lock state, banner slide-down for disconnect.

---

## Tech Stack

```
Framework   : Next.js 14 (App Router) — all socket components must be 'use client'
Styling     : Tailwind CSS v3 — no CSS Modules, no inline style objects
Socket      : socket.io-client
State       : React useState + useContext (no Redux needed)
Icons       : lucide-react (Lock, Unlock, Wifi, WifiOff, AlertTriangle, User, Ticket)
Font        : Geist Mono for ticket IDs + status codes | Geist Sans for body text
```

---

## Component Architecture

```
app/
  page.tsx                     ← root, renders <HelpDeskDashboard />

features/
  ticket-board/
    components/
      TicketBoard.tsx           ← main list container
      TicketRow.tsx             ← single row, receives lock state as prop
      NewTicketToast.tsx        ← slide-in badge when new ticket arrives
    hooks/
      useTicketList.ts          ← manages ticket[] state, handles new_ticket event

  presence-lock/
    components/
      LockBadge.tsx             ← 🔒 icon + "Locked by [Name]" — red pill
      LockedTicketRow.tsx       ← gray bg variant, disabled Edit btn
      AgentPresenceBar.tsx      ← top bar: avatars of who is currently active
    hooks/
      useTicketLock.ts          ← emits lock_ticket, receives ticket_locked broadcast

  connection-resilience/
    components/
      ConnectionBanner.tsx      ← red/amber top banner for disconnect state
      SaveCloseControls.tsx     ← Save + Close buttons, emits unlock_ticket
    hooks/
      useConnectionStatus.ts    ← tracks connect/disconnect socket events
      useUnlockOnExit.ts        ← beforeunload + save/close unlock logic

shared/
  socket/
    socketClient.ts             ← singleton: io(url, { reconnectionDelay: 1000, randomizationFactor: 0.5 })
  context/
    SocketContext.tsx           ← provides socket instance to all children
    AgentContext.tsx            ← provides { agentId, agentName } globally
  types/
    ticket.types.ts             ← Ticket, LockState, Agent interfaces
```

---

## Requirement 1 — Live Ticket Board

### What to build
A full-width dashboard table/list showing all active support tickets.

### Ticket row must display
| Field | Style |
|---|---|
| Ticket ID | `font-mono text-sm text-gray-400` e.g. `#TK-1042` |
| Subject | `font-semibold text-gray-900 text-base` truncated |
| Priority | Colored pill — `RED` = Critical, `AMBER` = High, `BLUE` = Normal |
| Status | Colored pill — `GREEN` = Open, `BLUE` = In Progress, `GRAY` = Closed |
| Assigned Agent | Avatar initials circle + name |
| Created time | Relative time e.g. "3 min ago" |
| Edit button | `bg-blue-600 text-white px-3 py-1 rounded` — disabled state = `opacity-40 cursor-not-allowed` |

### Socket rule — STRICT
```ts
// ✅ CORRECT
socket.on('new_ticket', (ticket: Ticket) => {
  setTickets(prev => [ticket, ...prev])  // prepend, triggers slide-in
})

// ❌ FORBIDDEN — never do this
setInterval(() => fetchTickets(), 5000)
```

### New ticket animation
When a ticket prepends to the list, it must **slide in from the top**:
```css
@keyframes slideIn {
  from { opacity: 0; transform: translateY(-16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.ticket-new { animation: slideIn 0.3s ease-out; }
```
Apply `ticket-new` class for 1 second then remove it.

---

## Requirement 2 — Presence & Locking UI

### Lock flow (strict — no optimistic updates)
```
Agent clicks ticket row
  → emit socket.emit('lock_ticket', { ticketId, agentId, agentName })
  → DO NOT change UI yet — wait for server confirmation
  → server broadcasts ticket_locked to ALL clients
  → THEN update UI for everyone
```

### Locked row visual spec
```
Background  : bg-gray-100  (the entire row)
Opacity     : normal (don't fade the text — it must still be readable)
Left border : border-l-4 border-red-500  (strong red left accent)
Padlock     : <Lock size={14} className="text-red-500 mr-1" />
Label       : "Locked by [Agent Name]"  → text-red-600 text-xs font-medium
Edit button : disabled + cursor-not-allowed + opacity-40
              → for the lock HOLDER only: button stays blue and enabled
              → use AgentContext to compare agentId === lock.agentId
```

### AgentPresenceBar (top of dashboard)
- Show avatar circles for all currently connected agents
- `GREEN dot` on avatar = active/online
- If agent is editing a ticket, show ticket ID tooltip on hover
- Max 8 avatars visible, "+N more" overflow badge

---

## Requirement 3 — Release Protocol & Graceful Degradation

### Unlock flow
```ts
// On Save button click:
const handleSave = () => {
  saveTicketToServer(formData)
  socket.emit('unlock_ticket', { ticketId })
  closeEditPanel()
}

// On Close button click (no save):
const handleClose = () => {
  socket.emit('unlock_ticket', { ticketId })
  closeEditPanel()
}

// On tab close / browser kill:
useEffect(() => {
  const handleUnload = () => socket.emit('unlock_ticket', { ticketId })
  window.addEventListener('beforeunload', handleUnload)
  return () => window.removeEventListener('beforeunload', handleUnload)
}, [ticketId])
```

### ConnectionBanner — disconnect state
```
Position    : top of page, full width, slides DOWN on disconnect
Background  : bg-red-600
Text        : "⚠ Connection Lost: Reconnecting..." — text-white font-semibold
Icon        : <WifiOff size={16} className="mr-2" />
Animation   : slide down from top (translateY -100% → 0) over 200ms
```

### ConnectionBanner — reconnecting state
```
Background  : bg-amber-500
Text        : "Reconnecting... please wait"
```

### ConnectionBanner — connected / dismissed
```
Animate back UP and remove from DOM
Trigger fresh lock state fetch: socket.emit('get_lock_state')
```

### Socket init with reconnection safety
```ts
// shared/socket/socketClient.ts
import { io } from 'socket.io-client'

export const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
  reconnectionDelay: 1000,
  randomizationFactor: 0.5,      // stagger 50 agents so they don't all hit server at once
  reconnectionDelayMax: 5000,
  transports: ['websocket'],
})
```

---

## Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [ConnectionBanner — hidden when connected]                 │
├──────────────────────────────────────────────────────────┬──┤
│  RapidDispatch Live Ops              [AgentPresenceBar]  │  │
│  50 active tickets · 12 agents online                   │  │
├──────────────────────────────────────────────────────────┤  │
│  [Search bar]    [Filter: Priority ▼] [Filter: Status ▼] │  │
├─────┬────────────────────────┬──────────┬────────┬───────┤  │
│ ID  │ Subject                │ Priority │ Status │ Edit  │  │
├─────┼────────────────────────┼──────────┼────────┼───────┤  │
│#105 │ Truck breakdown — TX   │ CRITICAL │ OPEN   │[Edit] │  │  ← GREEN border = unlocked
├─────┼────────────────────────┼──────────┼────────┼───────┤  │
│#104 │ 🔒 Locked by Priya S.  │ HIGH     │ IN PRG │[----] │  │  ← RED border + gray bg = locked
├─────┼────────────────────────┼──────────┼────────┼───────┤  │
│#103 │ Double billing — FL    │ NORMAL   │ OPEN   │[Edit] │  │
└─────┴────────────────────────┴──────────┴────────┴───────┴──┘
```

---

## Color Reference (Tailwind classes)

| State | Row bg | Left border | Badge | Text |
|---|---|---|---|---|
| Unlocked / Available | `bg-white` | `border-l-4 border-green-400` | `bg-green-100 text-green-800` | normal |
| Locked by other | `bg-gray-100` | `border-l-4 border-red-500` | `bg-red-100 text-red-700` | `text-gray-500` |
| Locked by me | `bg-blue-50` | `border-l-4 border-blue-500` | `bg-blue-100 text-blue-800` | normal |
| New (animating) | `bg-blue-50` | `border-l-4 border-blue-400` | — | normal |
| Disconnected banner | `bg-red-600` | — | — | `text-white` |
| Reconnecting banner | `bg-amber-500` | — | — | `text-white` |

---

## Accessibility & Performance Rules

- All status changes must work WITHOUT color alone (add icon + text alongside color)
- `aria-disabled="true"` on locked Edit buttons, not just visual opacity
- Ticket table must support keyboard navigation (Tab through rows)
- On low-end devices: if >200 tickets, virtualize the list (react-window or similar)
- Socket event listeners must be cleaned up in useEffect return

---

## What NOT to do

```
❌ setInterval for polling
❌ Optimistic lock update before server confirms
❌ CSS Modules (use Tailwind only)
❌ Multiple socket instances (use singleton from SocketContext)
❌ Gradient backgrounds (background is transparent / white cards only)
❌ Purple/pink decorative colors (colors are semantic: blue/green/red/amber only)
❌ Small font sizes for status/priority — must be legible on wall monitors
❌ Animations longer than 400ms (ops dashboards need snappy feedback)
```
