export function formatShortTime(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return '<1m ago';
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 1) return `${diffMins}m ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 1) return `${diffHrs}h ago`;
  return `${diffDays}d ago`;
}
