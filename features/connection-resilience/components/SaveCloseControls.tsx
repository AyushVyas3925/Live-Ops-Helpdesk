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
      {/* Close button */}
      <button
        id={`close-btn-${ticketId}`}
        onClick={handleClose}
        aria-label="Close ticket editor without saving"
        className="btn-panel-close"
      >
        <i className="ti ti-x" style={{ fontSize: 12 }} aria-hidden="true" />
        Close
      </button>

      {/* Save button */}
      <button
        id={`save-btn-${ticketId}`}
        onClick={handleSave}
        disabled={isSaving}
        aria-label="Save changes and release ticket lock"
        className="btn-panel-save ctrl-btn-save"
      >
        <i className="ti ti-device-floppy" style={{ fontSize: 12 }} aria-hidden="true" />
        {isSaving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}
