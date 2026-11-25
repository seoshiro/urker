// Low-precision solar and lunar ephemeris (after Meeus / the public-domain SunCalc formulas).
// Accurate to a fraction of a degree and a few minutes, which is all a booking page needs.

const RAD = Math.PI / 180;
const DAY_MS = 86_400_000;
const J1970 = 2440588;
const J2000 = 2451545;
const OBLIQUITY = RAD * 23.4397;

/** The plateau: 43°13′N 77°52′E, 2,700 m. */
export const SITE = { lat: 43.225, lng: 77.871 } as const;

/** shortcut: Kazakhstan is on a single UTC+5 zone with no DST since 2024; use Intl if that changes. */
export const TZ_OFFSET_MS = 5 * 3_600_000;

const toDays = (date: Date) => date.valueOf() / DAY_MS - 0.5 + J1970 - J2000;

const rightAscension = (l: number, b: number) =>
  Math.atan2(Math.sin(l) * Math.cos(OBLIQUITY) - Math.tan(b) * Math.sin(OBLIQUITY), Math.cos(l));
const declination = (l: number, b: number) =>
  Math.asin(Math.sin(b) * Math.cos(OBLIQUITY) + Math.cos(b) * Math.sin(OBLIQUITY) * Math.sin(l));

const siderealTime = (d: number, lw: number) => RAD * (280.16 + 360.9856235 * d) - lw;

function altitudeOf(ra: number, dec: number, date: Date, site = SITE) {
  const lw = RAD * -site.lng;
  const phi = RAD * site.lat;
  const H = siderealTime(toDays(date), lw) - ra;
  return Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H));
}

function sunCoords(d: number) {
  const M = RAD * (357.5291 + 0.98560028 * d);
  const C = RAD * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
  const L = M + C + RAD * 102.9372 + Math.PI;
  return { dec: declination(L, 0), ra: rightAscension(L, 0) };
}

function moonCoords(d: number) {
  const L = RAD * (218.316 + 13.176396 * d);
  const M = RAD * (134.963 + 13.064993 * d);
  const F = RAD * (93.272 + 13.22935 * d);
  const l = L + RAD * 6.289 * Math.sin(M);
  const b = RAD * 5.128 * Math.sin(F);
  return { ra: rightAscension(l, b), dec: declination(l, b), dist: 385001 - 20905 * Math.cos(M) };
}

/** Sun altitude in degrees above the horizon. */
export const sunAltitude = (date: Date, site = SITE) => {
  const s = sunCoords(toDays(date));
  return altitudeOf(s.ra, s.dec, date, site) / RAD;
};

/** Moon altitude in degrees above the horizon (no parallax/refraction: ±1°). */
export const moonAltitude = (date: Date, site = SITE) => {
  const m = moonCoords(toDays(date));
  return altitudeOf(m.ra, m.dec, date, site) / RAD;
};

/** fraction: 0 new → 1 full. phase: 0 new, 0.25 first quarter, 0.5 full, 0.75 last quarter. */
export function moonIllumination(date: Date) {
  const d = toDays(date);
  const s = sunCoords(d);
  const m = moonCoords(d);
  const sdist = 149_598_000;
  const phi = Math.acos(
    Math.sin(s.dec) * Math.sin(m.dec) + Math.cos(s.dec) * Math.cos(m.dec) * Math.cos(s.ra - m.ra),
  );
  const inc = Math.atan2(sdist * Math.sin(phi), m.dist - sdist * Math.cos(phi));
  const angle = Math.atan2(
    Math.cos(s.dec) * Math.sin(s.ra - m.ra),
    Math.sin(s.dec) * Math.cos(m.dec) - Math.cos(s.dec) * Math.sin(m.dec) * Math.cos(s.ra - m.ra),
  );
  return {
    fraction: (1 + Math.cos(inc)) / 2,
    phase: 0.5 + (0.5 * inc * (angle < 0 ? -1 : 1)) / Math.PI,
  };
}

/**
 * First moment after `from` when `altitude` crosses `threshold` in the given direction,
 * found by a 5-minute scan and then bisection to the second. null if none within `horizonH`.
 */
export function nextCrossing(
  altitude: (d: Date) => number,
  threshold: number,
  direction: 'down' | 'up',
  from: Date,
  horizonH = 36,
): Date | null {
  const step = 5 * 60_000;
  const above = (t: number) => altitude(new Date(t)) > threshold;
  const start = from.valueOf();
  let prev = start;
  let wasAbove = above(prev);
  for (let t = start + step; t <= start + horizonH * 3_600_000; t += step) {
    const isAbove = above(t);
    if (isAbove !== wasAbove && wasAbove === (direction === 'down')) {
      let lo = prev;
      let hi = t;
      while (hi - lo > 1000) {
        const mid = (lo + hi) / 2;
        if (above(mid) === wasAbove) lo = mid;
        else hi = mid;
      }
      return new Date(hi);
    }
    wasAbove = isAbove;
    prev = t;
  }
  return null;
}

/** Astronomical dusk: the sun sinks past −18° and the sky is fully dark. */
export const nextAstronomicalDusk = (from: Date) => nextCrossing(sunAltitude, -18, 'down', from);

/** Local clock time on the plateau as HH:MM. */
export function localTime(date: Date) {
  const t = new Date(date.valueOf() + TZ_OFFSET_MS);
  return `${String(t.getUTCHours()).padStart(2, '0')}:${String(t.getUTCMinutes()).padStart(2, '0')}`;
}
