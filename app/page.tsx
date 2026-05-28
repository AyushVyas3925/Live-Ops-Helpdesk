import ConnectionBanner from '@/features/connection-resilience/components/ConnectionBanner';
import TicketBoard from '@/features/ticket-board/components/TicketBoard';

export default function HelpDeskPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#F8FAFC' }}>
      <ConnectionBanner />
      <main style={{ flex: 1, overflow: 'hidden' }}>
        <TicketBoard />
      </main>
    </div>
  );
}
