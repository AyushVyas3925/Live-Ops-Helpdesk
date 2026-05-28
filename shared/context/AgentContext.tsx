'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

const AGENT_NAMES = [
  'Priya S.', 'Marcus T.', 'Jordan K.', 'Aisha R.', 'Devon L.',
  'Camille W.', 'Ravi P.', 'Nadia O.', 'Tyler B.', 'Simone F.',
];

function getInitials(name: string) {
  return name.split(' ').map(p => p[0]).join('').toUpperCase();
}

interface AgentContextValue {
  agentId: string;
  agentName: string;
  initials: string;
}

const AgentContext = createContext<AgentContextValue | null>(null);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [agent, setAgent] = useState<AgentContextValue>({
    agentId: '',
    agentName: '',
    initials: '',
  });

  useEffect(() => {
    let agentId = localStorage.getItem('agentId');
    let agentName = localStorage.getItem('agentName');

    if (!agentId) {
      agentId = `agent-${crypto.randomUUID()}`;
      localStorage.setItem('agentId', agentId);
    }

    if (!agentName) {
      agentName = AGENT_NAMES[Math.floor(Math.random() * AGENT_NAMES.length)];
      localStorage.setItem('agentName', agentName);
    }

    const timer = setTimeout(() => {
      setAgent({ agentId, agentName, initials: getInitials(agentName) });
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AgentContext.Provider value={agent}>
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  const ctx = useContext(AgentContext);
  if (!ctx) throw new Error('useAgent must be used inside AgentProvider');
  return ctx;
}
