const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  pingTimeout: 10000,
  pingInterval: 5000,
});

// In-memory state — a real server would persist this in Redis
const locks = new Map();   // ticketId → { ticketId, agentId, agentName, lockedAt }
const agents = new Map();  // socketId → { agentId, agentName, editingTicketId }

function broadcastPresence() {
  io.emit('presence_update', Array.from(agents.values()));
}

function releaseAllLocksForAgent(agentId) {
  for (const [ticketId, lock] of locks.entries()) {
    if (lock.agentId === agentId) {
      locks.delete(ticketId);
      io.emit('ticket_unlocked', { ticketId });
    }
  }
}

io.on('connection', (socket) => {
  socket.on('agent_join', (agent) => {
    agents.set(socket.id, { ...agent, editingTicketId: null });
    broadcastPresence();
    // Send current full lock state to newly joined agent
    socket.emit('lock_state', Array.from(locks.values()));
  });

  socket.on('lock_ticket', ({ ticketId, agentId, agentName }) => {
    // If already locked by someone else, reject
    if (locks.has(ticketId) && locks.get(ticketId).agentId !== agentId) {
      socket.emit('lock_rejected', { ticketId, lockedBy: locks.get(ticketId).agentName });
      return;
    }

    const lock = { ticketId, agentId, agentName, lockedAt: new Date().toISOString() };
    locks.set(ticketId, lock);

    // Update agent presence to show what they're editing
    const agent = agents.get(socket.id);
    if (agent) {
      agents.set(socket.id, { ...agent, editingTicketId: ticketId });
      broadcastPresence();
    }

    // Broadcast to ALL clients including sender — no optimistic updates on client
    io.emit('ticket_locked', lock);
  });

  socket.on('unlock_ticket', ({ ticketId }) => {
    if (!locks.has(ticketId)) return;

    locks.delete(ticketId);

    const agent = agents.get(socket.id);
    if (agent) {
      agents.set(socket.id, { ...agent, editingTicketId: null });
      broadcastPresence();
    }

    io.emit('ticket_unlocked', { ticketId });
  });

  socket.on('get_lock_state', () => {
    socket.emit('lock_state', Array.from(locks.values()));
  });

  socket.on('disconnect', () => {
    const agent = agents.get(socket.id);
    if (agent) {
      // Auto-unlock all tickets held by disconnected agent
      releaseAllLocksForAgent(agent.agentId);
      agents.delete(socket.id);
      io.emit('agent_left', { agentId: agent.agentId });
      broadcastPresence();
    }
  });
});

// Emit a simulated new ticket every 45 seconds for demo
const DEMO_SUBJECTS = [
  'Overheated engine — Unit RD-312, I-10 near El Paso TX',
  'Lost cargo claim — Shipment RD-7741, Houston TX',
  'Delayed border crossing — Laredo TX checkpoint',
  'Tire blowout — Route 66 near Flagstaff AZ',
  'Warehouse refused delivery — incorrect SKU, Chicago IL',
  'Driver reporting unsafe road conditions — I-90 near Cleveland OH',
];

let demoIndex = 0;
setInterval(() => {
  const ticket = {
    id: `TK-${2000 + demoIndex}`,
    subject: DEMO_SUBJECTS[demoIndex % DEMO_SUBJECTS.length],
    priority: ['critical', 'high', 'normal'][Math.floor(Math.random() * 3)],
    status: 'open',
    agentId: 'auto-dispatch',
    agentName: 'Auto-dispatch',
    createdAt: new Date().toISOString(),
    description: 'Automatically dispatched ticket — requires agent assignment.',
    location: 'Dallas, TX (HQ)',
  };
  demoIndex++;
  io.emit('new_ticket', ticket);
}, 45000);

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Live Ops socket server running on port ${PORT}`);
});

httpServer.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Kill the existing process and retry.`);
    process.exit(1);
  }
  throw err;
});
