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
        style={{
          padding: '6px 14px',
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 600,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          background: '#F3F4F6',
          color: '#374151',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = '#E5E7EB')}
        onMouseLeave={e => (e.currentTarget.style.background = '#F3F4F6')}
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
        className="ctrl-btn-save"
        style={{
          padding: '6px 14px',
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 600,
          border: 'none',
          cursor: isSaving ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          background: '#2563EB',
          color: '#fff',
          opacity: isSaving ? 0.5 : 1,
          transition: 'background 0.15s, opacity 0.15s',
        }}
        onMouseEnter={e => !isSaving && (e.currentTarget.style.background = '#1D4ED8')}
        onMouseLeave={e => (e.currentTarget.style.background = '#2563EB')}
      >
        <i className="ti ti-device-floppy" style={{ fontSize: 12 }} aria-hidden="true" />
        {isSaving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}
