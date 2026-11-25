/** The lit part of the moon for a phase (0 new → 0.5 full → 1 new), as seen from the north. */
export function MoonGlyph({ phase, size = 18 }: { phase: number; size?: number }) {
  const r = size / 2 - 1;
  const rx = Math.abs(Math.cos(2 * Math.PI * phase)) * r;
  const waxing = phase < 0.5;
  const bulgeOut = Math.cos(2 * Math.PI * phase) > 0;
  const limb = waxing ? 1 : 0;
  const term = waxing ? (bulgeOut ? 0 : 1) : bulgeOut ? 1 : 0;
  const d = `M0,${-r} A${r},${r} 0 0 ${limb} 0,${r} A${rx},${r} 0 0 ${term} 0,${-r}Z`;
  return (
    <svg className="moon" width={size} height={size} viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`} aria-hidden="true">
      <circle r={r} fill="none" stroke="currentColor" strokeWidth="1" opacity="0.45" />
      <path d={d} fill="currentColor" />
    </svg>
  );
}
