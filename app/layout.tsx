import type { Metadata } from 'next';
import './globals.css';
import { AgentProvider } from '@/shared/context/AgentContext';
import { SocketProvider } from '@/shared/context/SocketContext';

export const metadata: Metadata = {
  title: 'Live Ops Helpdesk — RapidDispatch Freight & Logistics',
  description: 'Real-time collaborative support ticket management for 50 simultaneous dispatch agents. Instant lock propagation via WebSocket.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ colorScheme: 'light' }}>
      <body className="antialiased bg-white text-gray-900">
        <AgentProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
        </AgentProvider>
      </body>
    </html>
  );
}
