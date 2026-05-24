import ConnectionBanner from '@/features/connection-resilience/components/ConnectionBanner';
import TicketBoard from '@/features/ticket-board/components/TicketBoard';

export default function HelpDeskPage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <ConnectionBanner />
      <main className="flex-1 overflow-hidden">
        <TicketBoard />
      </main>
    </div>
  );
}
