'use client';

import { useSocket } from '@/shared/context/SocketContext';
import { useUnlockOnExit } from '../hooks/useUnlockOnExit';

interface SaveCloseControlsProps {
  ticketId: string;
  onSave: () => void;
  onClose: () => void;
  isSaving: boolean;
}

export default function SaveCloseControls({ ticketId, onSave, onClose, isSaving }: SaveCloseControlsProps) {
  const socket = useSocket();
  useUnlockOnExit(ticketId);

  const handleSave = () => {
    onSave();
    socket.emit('unlock_ticket', { ticketId });
  };

  const handleClose = () => {
    socket.emit('unlock_ticket', { ticketId });
    onClose();
  };

  return (
    <div className="flex items-center gap-2">
      <button
        id={`close-btn-${ticketId}`}
        onClick={handleClose}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-bold text-[var(--color-text-secondary)] bg-[var(--color-background-secondary)] hover:bg-[var(--color-background-primary)] border border-[var(--color-border-secondary)] cursor-pointer transition-colors"
        aria-label="Close ticket editor without saving"
      >
        <i className="ti ti-x text-xs" aria-hidden="true" />
        Close
      </button>
      
      <button
        id={`save-btn-${ticketId}`}
        onClick={handleSave}
        disabled={isSaving}
        className="flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-sm"
        aria-label="Save changes and release ticket lock"
      >
        <i className="ti ti-device-floppy text-xs" aria-hidden="true" />
        {isSaving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}

