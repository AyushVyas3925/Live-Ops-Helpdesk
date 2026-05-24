'use client';

import { useConnectionStatus } from '../hooks/useConnectionStatus';

export default function ConnectionBanner() {
  const status = useConnectionStatus();

  if (status === 'connected') return null;

  const isReconnecting = status === 'reconnecting';

  const bg = isReconnecting ? '#D97706' : '#DC2626';

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="banner-slide show"
      style={{
        width: '100%',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontSize: 13,
        fontWeight: 600,
        background: bg,
        color: '#fff',
        zIndex: 20,
        position: 'relative',
      }}
    >
      <i
        className={`ti ${isReconnecting ? 'ti-wifi' : 'ti-wifi-off'}`}
        style={{ fontSize: 16 }}
        aria-hidden="true"
      />
      <span>
        {isReconnecting
          ? 'Reconnecting... please wait'
          : 'Connection lost — Reconnecting...'}
      </span>
    </div>
  );
}
