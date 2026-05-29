export const PRIORITY_PILL: Record<string, string> = {
  critical: 'bg-red-100 text-red-800',
  high:     'bg-amber-100 text-amber-800',
  normal:   'bg-blue-50 text-blue-700',
};

export const PRIORITY_PILL_BORDER: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 border border-red-200',
  high:     'bg-amber-100 text-amber-800 border border-amber-200',
  normal:   'bg-blue-50 text-blue-700 border border-blue-200',
};

export const PRIORITY_BORDER: Record<string, string> = {
  critical: 'border-l-[3px] border-l-red-500',
  high:     'border-l-[3px] border-l-amber-500',
  normal:   'border-l-[3px] border-l-blue-500',
};

export const STATUS_PILL: Record<string, string> = {
  open:        'bg-green-100 text-green-800',
  in_progress: 'bg-blue-50 text-blue-700',
  closed:      'bg-gray-100 text-gray-500',
};

export const STATUS_LABEL: Record<string, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  closed: 'Closed',
};

export const AGENT_BG: Record<string, string> = {
  'Marcus T.':  'bg-[#1e3a8a]',
  'Priya S.':   'bg-[#4c1d95]',
  'Jordan K.':  'bg-[#78350f]',
  'Aisha R.':   'bg-[#134e4a]',
  'Devon L.':   'bg-[#1e3a5f]',
  'Camille W.': 'bg-[#3b1764]',
  'Ravi P.':    'bg-[#7c2d12]',
  'Nadia O.':   'bg-[#14532d]',
  'Tyler B.':   'bg-[#1e1b4b]',
  'Simone F.':  'bg-[#831843]',
};

export const PRESENCE_PALETTE_BG = [
  'bg-[#1e3a8a]', 'bg-[#4c1d95]', 'bg-[#78350f]', 'bg-[#134e4a]',
  'bg-[#1e3a5f]', 'bg-[#3b1764]', 'bg-[#7c2d12]', 'bg-[#14532d]',
];

export function getAgentBg(name: string): string {
  return AGENT_BG[name] ?? 'bg-gray-700';
}

export function getPresenceAgentBg(agentId: string): string {
  let hash = 0;
  for (let i = 0; i < agentId.length; i++) hash = agentId.charCodeAt(i) + ((hash << 5) - hash);
  return PRESENCE_PALETTE_BG[Math.abs(hash) % PRESENCE_PALETTE_BG.length];
}
