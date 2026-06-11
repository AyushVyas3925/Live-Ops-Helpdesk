# 🚛 Live Ops Helpdesk — RapidDispatch Freight & Logistics

> Real-time collaborative support ticket management for 50+ simultaneous dispatch agents with instant lock propagation via WebSocket.

[![Live Demo](https://img.shields.io/badge/▶_Live_Demo-Vercel-000?style=for-the-badge&logo=vercel&logoColor=white)](https://live-ops-helpdesk-eta.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Socket.io](https://img.shields.io/badge/Socket.io-4-010101?style=flat-square&logo=socket.io)](https://socket.io)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)

---

## 🌐 Live Demo

**🔗 [https://live-ops-helpdesk-eta.vercel.app/](https://live-ops-helpdesk-eta.vercel.app/)**

Open the link in multiple browser tabs to simulate multiple dispatch agents collaborating in real-time.

---

## 📖 Overview

Live Ops Helpdesk is a real-time, multi-agent ticket management system designed for **RapidDispatch Freight & Logistics**. It allows up to 50 dispatch agents to simultaneously view, claim, and edit support tickets without stepping on each other's work — powered by **WebSocket-based pessimistic locking** and **live presence awareness**.

### The Problem

In a high-stakes logistics dispatch center, multiple agents may try to handle the same urgent ticket (e.g., *"Overheated engine on I-10 near El Paso"*). Without coordination, two agents could unknowingly duplicate work or make conflicting updates — causing delayed response times and confused drivers.

### The Solution

A **server-authoritative locking system** where:
- Only one agent can edit a ticket at a time (pessimistic lock).
- All other agents see the lock status in real-time (< 50ms propagation).
- Locks auto-release on disconnect, tab close, or browser crash.
- New incoming tickets stream live to all connected agents.

---

## ✨ Features

### 🎫 Ticket Board
- **Live ticket table** with priority-based color coding (🔴 Critical · 🟠 High · 🔵 Normal)
- **Slide-out edit panel** (React Portal) — non-blocking, so agents can view the ticket list while editing
- **Real-time new ticket streaming** — auto-dispatched tickets appear with a toast notification every 45 seconds
- **Keyboard-accessible focus trapping** inside the edit drawer for accessibility compliance

### 🔒 Presence & Locking
- **Pessimistic ticket locking** — server is the single source of truth; no optimistic UI races
- **Live agent presence bar** — see who's online and which ticket each agent is editing
- **Lock badge indicators** — locked tickets show the owning agent's name directly in the table row
- **Automatic lock release** on page close (`beforeunload`), disconnect, or navigation

### 🔌 Connection Resilience
- **Connection status banner** — visual indicator for connected / disconnected / reconnecting states
- **Jittered reconnection** — randomized delay (1–5s) prevents thundering-herd on server restart
- **Save & Close controls** — graceful UX for releasing locks and persisting edits
- **Strict Mode safe** — `autoConnect: false` prevents duplicate socket connections in React 18 dev mode

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Client (Next.js)                  │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ Ticket Board │  │Presence Lock │  │ Connection │ │
│  │   Feature    │  │   Feature    │  │ Resilience │ │
│  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘ │
│         │                 │                │         │
│  ┌──────┴─────────────────┴────────────────┴──────┐  │
│  │          Shared Context Layer                   │  │
│  │  AgentContext · SocketContext · ToastContext     │  │
│  └──────────────────────┬──────────────────────────┘  │
│                         │                             │
│              Socket.io Client (WebSocket)             │
└─────────────────────────┼─────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              │  Socket.io Server     │
              │  (Express + Node.js)  │
              │                       │
              │  • In-memory Map()    │
              │    locks & agents     │
              │  • REST: GET /tickets │
              │  • Auto-dispatch loop │
              └───────────────────────┘
```

---

## 📁 Project Structure

```
Live Ops Helpdesk/
├── app/                          # Next.js App Router
│   ├── api/tickets/              # API route (ticket proxy)
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Main helpdesk page
│   └── globals.css               # Global styles
│
├── features/                     # Feature-sliced modules
│   ├── ticket-board/
│   │   ├── components/
│   │   │   ├── TicketBoard.tsx       # Main ticket table
│   │   │   ├── TicketRow.tsx         # Individual ticket row
│   │   │   ├── TicketEditPanel.tsx   # Slide-out edit drawer (Portal)
│   │   │   └── NewTicketToast.tsx    # New ticket notification
│   │   └── hooks/
│   │       └── useTicketList.ts      # Ticket data & real-time sync
│   │
│   ├── presence-lock/
│   │   ├── components/
│   │   │   ├── AgentPresenceBar.tsx  # Online agents indicator
│   │   │   └── LockBadge.tsx         # Lock owner badge
│   │   └── hooks/
│   │       └── useTicketLock.ts      # Lock/unlock logic
│   │
│   └── connection-resilience/
│       ├── components/
│       │   ├── ConnectionBanner.tsx   # Connection status bar
│       │   └── SaveCloseControls.tsx  # Save & close buttons
│       └── hooks/
│           └── useUnlockOnExit.ts    # beforeunload cleanup
│
├── shared/                       # Cross-feature shared code
│   ├── context/
│   │   ├── AgentContext.tsx          # Agent identity provider
│   │   ├── SocketContext.tsx         # Socket.io provider
│   │   └── ToastContext.tsx          # Toast notification provider
│   ├── types/
│   │   └── ticket.types.ts          # TypeScript interfaces
│   ├── socket/                      # Socket client config
│   ├── constants/                   # App-wide constants
│   └── utils/                       # Utility functions
│
├── server/                       # Socket.io backend (dev)
│   ├── index.js                     # Express + Socket.io server
│   ├── seedTickets.js               # Seed data generator
│   └── package.json                 # Server dependencies
│
├── lib/                          # Library utilities
│   └── seedTickets.ts               # Seed data (client-side)
│
└── content/                      # Static content assets
```

---

## 🛠️ Tech Stack

| Layer      | Technology                       |
|------------|----------------------------------|
| Framework  | Next.js 16 (App Router)          |
| UI         | React 19, Tailwind CSS 4         |
| Language   | TypeScript 5                     |
| Realtime   | Socket.io 4 (WebSocket)          |
| Icons      | Lucide React                     |
| Dates      | date-fns                         |
| Server     | Express 4 + Node.js              |
| Deployment | Vercel                           |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm**, **yarn**, **pnpm**, or **bun**

### Installation

```bash
# Clone the repository
git clone https://github.com/AyushVyas3925/Live-Ops-Helpdesk.git
cd Live-Ops-Helpdesk

# Install client dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

### Run Development Server

```bash
npm run dev
```

This starts **both** the Next.js dev server and the Socket.io server concurrently:

- **Next.js** → [http://localhost:3000](http://localhost:3000)
- **Socket.io** → [http://localhost:4000](http://localhost:4000)

> 💡 **Tip:** Open multiple browser tabs at `localhost:3000` to simulate multiple dispatch agents and see real-time lock synchronization in action.

---

## 🧪 Multi-Agent Testing

1. Open **Tab 1** → You'll be assigned a random agent identity (e.g., *"Agent Carter"*)
2. Open **Tab 2** → A different agent identity is assigned (e.g., *"Agent Brooks"*)
3. In **Tab 1**, click **Edit** on any ticket → The ticket locks and a slide-out panel appears
4. In **Tab 2**, observe the same ticket now shows a 🔒 lock badge with *"Agent Carter"*
5. Close **Tab 1** → The lock auto-releases and **Tab 2** can now edit the ticket

---

## 📡 Socket Events

| Event               | Direction      | Description                          |
|---------------------|---------------|--------------------------------------|
| `agent_join`        | Client → Server | Register agent on connect            |
| `lock_ticket`       | Client → Server | Request exclusive ticket lock        |
| `unlock_ticket`     | Client → Server | Release a held lock                  |
| `get_lock_state`    | Client → Server | Request current lock snapshot        |
| `ticket_locked`     | Server → Client | Broadcast: ticket was locked         |
| `ticket_unlocked`   | Server → Client | Broadcast: ticket was unlocked       |
| `lock_rejected`     | Server → Client | Lock denied (already held)           |
| `lock_state`        | Server → Client | Full lock state snapshot             |
| `presence_update`   | Server → Client | Online agents list update            |
| `agent_left`        | Server → Client | Agent disconnected                   |
| `new_ticket`        | Server → Client | New ticket created (auto-dispatch)   |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is part of **ProdeskIT** — built for demonstration and portfolio purposes.

---

<p align="center">
  Built with ❤️ by <strong>Ayush Vyas</strong> · Powered by Next.js & Socket.io
</p>
