'use client';

import { useConnectionStatus } from '../hooks/useConnectionStatus';

export default function ConnectionBanner() {
  const status = useConnectionStatus();

  if (status === 'connected') return null;

  const isReconnecting = status === 'reconnecting';

  const bgClass = isReconnecting ? 'bg-amber-600' : 'bg-red-600';

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`banner-slide show w-full py-2.5 px-5 flex items-center gap-2.5 text-[13px] font-semibold text-white z-20 relative ${bgClass}`}
    >
      <i
        className={`ti ${isReconnecting ? 'ti-wifi' : 'ti-wifi-off'} text-base`}
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
