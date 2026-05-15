export function timestampMs(timestamp: number): number {
  return timestamp < 10_000_000_000 ? timestamp * 1000 : timestamp;
}

export function timeAgo(timestamp: number, nowMs: number): string {
  const seconds = Math.max(0, Math.floor((nowMs - timestampMs(timestamp)) / 1000));
  let interval = seconds / 86400;
  if (interval > 1) return `${Math.floor(interval)}d ago`;
  interval = seconds / 3600;
  if (interval > 1) return `${Math.floor(interval)}h ago`;
  interval = seconds / 60;
  if (interval > 1) return `${Math.floor(interval)}m ago`;
  return `${seconds}s ago`;
}

export default {
  timeAgo,
  timestampMs,
};
