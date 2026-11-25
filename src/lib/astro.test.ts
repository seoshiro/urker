import { describe, expect, it } from 'vitest';
import { localTime, moonIllumination, nextAstronomicalDusk, sunAltitude } from './astro';
import { darkWindow, kindOf, localInstant, nightFor, upcomingNights } from './nights';

describe('ephemeris', () => {
  it('puts the June solstice noon sun at about 70° over the plateau', () => {
    // Solar noon at 77.87°E is ~06:50 UTC.
    expect(sunAltitude(new Date('2026-06-21T06:50:00Z'))).toBeCloseTo(70.2, 0);
  });

  it('knows the 2026 full and new moons', () => {
    expect(moonIllumination(new Date('2026-11-24T14:53:00Z')).fraction).toBeGreaterThan(0.98);
    expect(moonIllumination(new Date('2026-12-09T00:51:00Z')).fraction).toBeLessThan(0.02);
    expect(moonIllumination(new Date('2026-12-01T00:00:00Z')).phase).toBeGreaterThan(0.5); // waning
  });

  it('finds astronomical dusk in the evening, local time', () => {
    const dusk = nextAstronomicalDusk(new Date('2026-12-09T06:00:00Z'))!;
    expect(Math.abs(sunAltitude(dusk) + 18)).toBeLessThan(0.05);
    expect(localTime(dusk) >= '17:30' && localTime(dusk) <= '19:30').toBe(true);
  });
});

describe('nights', () => {
  it('classifies by illuminated fraction', () => {
    expect(kindOf(0.05)).toBe('dark');
    expect(kindOf(0.5)).toBe('half');
    expect(kindOf(0.95)).toBe('moonlight');
  });

  it('gives a new-moon night a long dark window and a full-moon night none', () => {
    const dark = darkWindow('2026-12-09')!;
    expect(dark.minutes).toBeGreaterThan(10 * 60);
    expect(darkWindow('2026-11-24')).toBeNull();
  });

  it('builds a stable calendar', () => {
    const a = upcomingNights(localInstant('2026-11-26', 12), 30);
    expect(a).toHaveLength(30);
    expect(a[0].date).toBe('2026-11-26');
    expect(nightFor('2026-12-09').kind).toBe('dark');
    expect(upcomingNights(localInstant('2026-11-26', 12), 30)).toEqual(a);
    for (const n of a) expect(n.cabinsLeft).toBeGreaterThanOrEqual(0);
  });
});
