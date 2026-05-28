import type { Metadata } from 'next';
import './globals.css';
import { AgentProvider }  from '@/shared/context/AgentContext';
import { SocketProvider } from '@/shared/context/SocketContext';
import { ToastProvider }  from '@/shared/context/ToastContext';

export const metadata: Metadata = {
  title:       'Live Ops Helpdesk — RapidDispatch Freight & Logistics',
  description: 'Real-time collaborative support ticket management for 50 simultaneous dispatch agents. Instant lock propagation via WebSocket.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ colorScheme: 'light', background: '#F8FAFC' }}>
      <body
        style={{
          margin: 0,
          padding: 0,
          background: '#F8FAFC',
          color: '#111827',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }}
      >
        <AgentProvider>
          <SocketProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </SocketProvider>
        </AgentProvider>
      </body>
    </html>
  );
}
