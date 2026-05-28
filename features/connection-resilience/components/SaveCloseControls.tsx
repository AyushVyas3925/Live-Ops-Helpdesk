'use client';

import { useSocket } from '@/shared/context/SocketContext';
import { useUnlockOnExit } from '../hooks/useUnlockOnExit';

interface SaveCloseControlsProps {
  ticketId: string;
  onSave:   () => void;
  onClose:  () => void;
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button
        id={`close-btn-${ticketId}`}
        onClick={handleClose}
        aria-label="Close ticket editor without saving"
        className="btn-panel-close"
      >
        <i className="ti ti-x" style={{ fontSize: 12 }} aria-hidden="true" />
        Close
      </button>

      <button
        id={`save-btn-${ticketId}`}
        onClick={handleSave}
        disabled={isSaving}
        aria-label="Save changes and release ticket lock"
        className="btn-panel-save ctrl-btn-save"
      >
        {isSaving ? (
          <svg className="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <i className="ti ti-device-floppy" style={{ fontSize: 12 }} aria-hidden="true" />
        )}
        {isSaving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}
