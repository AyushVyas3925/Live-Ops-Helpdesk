'use client';

interface LockBadgeProps {
  agentName: string;
  isOwnLock: boolean;
}

export default function LockBadge({ agentName, isOwnLock }: LockBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
        isOwnLock
          ? 'bg-[#E6F1FB] text-[#0C447C] border-blue-200/60'
          : 'bg-[#FCEBEB] text-[#A32D2D] border-red-200/60'
      }`}
      aria-label={`Locked by ${agentName}`}
    >
      <i className="ti ti-lock text-[10px]" aria-hidden="true" />
      {isOwnLock ? 'Locked by you' : `Locked by ${agentName}`}
    </span>
  );
}

