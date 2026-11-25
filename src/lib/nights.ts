import { moonAltitude, moonIllumination, sunAltitude, TZ_OFFSET_MS } from './astro';

export type NightKind = 'dark' | 'half' | 'moonlight';

export interface Night {
  /** Local calendar date of the evening, YYYY-MM-DD. */
  date: string;
  /** 23:00 local, the reference moment for the moon. */
  at: Date;
  fraction: number;
  phase: number;
  kind: NightKind;
  priceKzt: number;
  cabinsLeft: number;
  /** Longest stretch with the sun below −18° and the moon below the horizon. */
  dark: { start: Date; end: Date; minutes: number } | null;
}

export const CABINS = 6;

export const NIGHT_KINDS: Record<NightKind, { label: string; note: string; priceKzt: number }> = {
  dark: { label: 'Dark night', note: 'New moon. Observation through the slit until dawn.', priceKzt: 148_000 },
  half: { label: 'Half-light', note: 'A partial moon. Planets early, deep sky after moonset.', priceKzt: 96_000 },
  moonlight: { label: 'Moonlight walk', note: 'Full moon. The telescopes rest; the ridge path opens.', priceKzt: 72_000 },
};

export function kindOf(fraction: number): NightKind {
  if (fraction < 0.25) return 'dark';
  if (fraction > 0.75) return 'moonlight';
  return 'half';
}

/** Local midnight-based date key for an instant. */
export const dateKey = (d: Date) => new Date(d.valueOf() + TZ_OFFSET_MS).toISOString().slice(0, 10);

/** The instant of a local wall-clock hour on a given local date. */
export const localInstant = (date: string, hour: number) =>
  new Date(Date.parse(`${date}T00:00:00Z`) + hour * 3_600_000 - TZ_OFFSET_MS);

/** Deterministic 0..1 hash, so simulated occupancy is stable across reloads. */
function hash01(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return ((h >>> 0) % 10_000) / 10_000;
}

/** Scan 18:00 → 08:00 local in 5-minute steps and keep the longest truly dark run. */
export function darkWindow(date: string) {
  const step = 5 * 60_000;
  const from = localInstant(date, 18).valueOf();
  const to = localInstant(date, 32).valueOf();
  let best: Night['dark'] = null;
  let runStart: number | null = null;
  for (let t = from; t <= to + step; t += step) {
    const at = new Date(t);
    const isDark = t <= to && sunAltitude(at) < -18 && moonAltitude(at) < 0;
    if (isDark && runStart === null) runStart = t;
    if (!isDark && runStart !== null) {
      const minutes = Math.round((t - runStart) / 60_000);
      if (!best || minutes > best.minutes) best = { start: new Date(runStart), end: new Date(t), minutes };
      runStart = null;
    }
  }
  return best;
}

export function nightFor(date: string): Night {
  const at = localInstant(date, 23);
  const { fraction, phase } = moonIllumination(at);
  const kind = kindOf(fraction);
  // shortcut: occupancy is simulated (this is a concept, there is no booking backend); dark nights sell out first.
  const demand = kind === 'dark' ? 0.75 : kind === 'half' ? 0.45 : 0.3;
  const booked = Math.min(CABINS, Math.floor(hash01(date) * CABINS * demand * 1.6));
  return {
    date,
    at,
    fraction,
    phase,
    kind,
    priceKzt: NIGHT_KINDS[kind].priceKzt,
    cabinsLeft: CABINS - booked,
    dark: darkWindow(date),
  };
}

/** The next `count` nights starting with the evening of `from`. */
export function upcomingNights(from: Date, count: number): Night[] {
  const first = Date.parse(`${dateKey(from)}T00:00:00Z`);
  return Array.from({ length: count }, (_, i) => nightFor(new Date(first + i * 86_400_000).toISOString().slice(0, 10)));
}
