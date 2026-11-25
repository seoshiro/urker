export const deg = (n: number) => `${n >= 0 ? '+' : '−'}${Math.abs(n).toFixed(1)}°`;
export const pct = (f: number) => `${Math.round(f * 100)}%`;
export const kzt = (n: number) => `${new Intl.NumberFormat('en-US').format(n).replace(/,/g, ' ')} ₸`;

export function countdown(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
}

export const hm = (minutes: number) => `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
