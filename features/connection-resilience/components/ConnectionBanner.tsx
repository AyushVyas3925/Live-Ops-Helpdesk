'use client';

import { useEffect, useRef } from 'react';
import { useConnectionStatus } from '../hooks/useConnectionStatus';

export default function ConnectionBanner() {
  const status = useConnectionStatus();
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bannerRef.current;
    if (!el) return;

    if (status === 'disconnected' || status === 'reconnecting') {
      el.style.transform = 'translateY(0)';
      el.style.opacity = '1';
    } else {
      el.style.transform = 'translateY(-100%)';
      el.style.opacity = '0';
    }
  }, [status]);

  if (status === 'connected') return null;

  const isReconnecting = status === 'reconnecting';

  return (
    <div
      ref={bannerRef}
      role="alert"
      aria-live="assertive"
      className={`w-full flex items-center justify-center gap-2 px-4 py-2 font-bold text-white text-xs transition-transform duration-200 border-b ${
        isReconnecting 
          ? 'bg-amber-500 border-amber-600' 
          : 'bg-red-600 border-red-700'
      }`}
      style={{ transform: 'translateY(-100%)', opacity: 0 }}
    >
      {isReconnecting ? (
        <>
          <i className="ti ti-wifi text-sm animate-pulse" aria-hidden="true" />
          SYSTEM PROTOCOL: Reconnecting to dispatch network... please wait
        </>
      ) : (
        <>
          <i className="ti ti-wifi-off text-sm animate-bounce" aria-hidden="true" />
          CRITICAL ERROR: Connection to dispatch network lost. Reconnecting...
        </>
      )}
    </div>
  );
}

