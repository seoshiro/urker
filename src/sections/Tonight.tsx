import { useMemo, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react';
import { LoopVideo } from '../components/LoopVideo';
import { localTime, moonAltitude, moonIllumination, sunAltitude } from '../lib/astro';
import { dateKey, localInstant } from '../lib/nights';
import { deg, pct } from '../lib/format';

const W = 1000;
const H = 360;
const STEP_MIN = 10;
const N = (24 * 60) / STEP_MIN + 1;
const LO = -80;
const HI = 85;
const y = (alt: number) => ((HI - Math.max(LO, Math.min(HI, alt))) / (HI - LO)) * H;
const x = (i: number) => (i / (N - 1)) * W;

function skyState(sun: number, moon: number) {
  if (sun > 0) return 'Daylight';
  if (sun > -18) return 'Twilight';
  return moon > 0 ? 'Moonlit' : 'Dark sky';
}

/** Noon-to-noon samples for the night that is current (or coming) on the plateau. */
function useNightSamples() {
  return useMemo(() => {
    const now = new Date();
    let start = localInstant(dateKey(now), 12);
    if (start > now) start = new Date(start.valueOf() - 86_400_000);
    const samples = Array.from({ length: N }, (_, i) => {
      const at = new Date(start.valueOf() + i * STEP_MIN * 60_000);
      return { at, sun: sunAltitude(at), moon: moonAltitude(at) };
    });
    const path = (key: 'sun' | 'moon') =>
      samples.map((s, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(s[key]).toFixed(1)}`).join('');
    const bands: { from: number; to: number }[] = [];
    samples.forEach((s, i) => {
      if (!(s.sun < -18 && s.moon < 0)) return;
      const last = bands[bands.length - 1];
      if (last && last.to === i - 1) last.to = i;
      else bands.push({ from: i, to: i });
    });
    return { samples, sunPath: path('sun'), moonPath: path('moon'), bands, date: dateKey(start) };
  }, []);
}

export function Tonight() {
  const ref = useRef<HTMLElement>(null);
  const { samples, sunPath, moonPath, bands, date } = useNightSamples();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const draw = useTransform(scrollYProgress, [0.04, 0.96], [0, 1], { clamp: true });
  const [i, setI] = useState(0);
  useMotionValueEvent(draw, 'change', (v) => setI(Math.round(v * (N - 1))));
  const s = samples[i];
  const illum = moonIllumination(s.at);
  const cx = x(i);

  return (
    <section ref={ref} className="tonight" id="tonight" aria-label="Tonight over the plateau">
      <div className="tonight-stage">
        <div className="fill grain">
          <LoopVideo name="stars" />
        </div>
        <div className="shade" />
        <div className="tonight-grid">
          <div>
            <span className="label">02 / Tonight over the plateau · {date}</span>
            <div className="clock">{localTime(s.at)}</div>
            <div className="readout">
              <div>
                <span className="label">Sky</span>
                <span className="val">{skyState(s.sun, s.moon)}</span>
              </div>
              <div>
                <span className="label">Moon lit</span>
                <span className="val">{pct(illum.fraction)}</span>
              </div>
              <div>
                <span className="label">Sun</span>
                <span className="val">{deg(s.sun)}</span>
              </div>
              <div>
                <span className="label">Moon</span>
                <span className="val">{deg(s.moon)}</span>
              </div>
            </div>
            <p className="label" style={{ marginTop: 18 }}>
              Scroll to move through the night · computed in your browser for 43.2°N
            </p>
          </div>
          <svg className="chart" viewBox={`0 -28 ${W} ${H + 56}`} role="img" aria-label="Altitude of the sun and the moon from noon to noon">
            {bands.map((b) => (
              <rect key={b.from} x={x(b.from)} y={0} width={x(b.to) - x(b.from)} height={H} fill="rgba(192,138,91,0.1)" />
            ))}
            <line x1={0} x2={W} y1={y(0)} y2={y(0)} stroke="rgba(236,228,214,0.4)" />
            <line x1={0} x2={W} y1={y(-18)} y2={y(-18)} stroke="rgba(236,228,214,0.3)" strokeDasharray="2 6" />
            <text x={0} y={y(0) - 8}>Horizon</text>
            <text x={0} y={y(-18) - 8}>−18° · astronomical dark</text>
            {[0, 6, 12, 18, 24].map((h) => (
              <text key={h} x={(h / 24) * W} y={H + 24} textAnchor={h === 0 ? 'start' : h === 24 ? 'end' : 'middle'}>
                {String((12 + h) % 24).padStart(2, '0')}:00
              </text>
            ))}
            <path d={sunPath} fill="none" stroke="rgba(192,138,91,0.2)" strokeWidth="1" />
            <path d={moonPath} fill="none" stroke="rgba(236,228,214,0.16)" strokeWidth="1" />
            <motion.path d={sunPath} fill="none" stroke="#c08a5b" strokeWidth="2" style={{ pathLength: draw }} />
            <motion.path d={moonPath} fill="none" stroke="#ece4d6" strokeWidth="1.5" style={{ pathLength: draw }} />
            <line x1={cx} x2={cx} y1={0} y2={H} stroke="rgba(236,228,214,0.5)" />
            <circle cx={cx} cy={y(s.sun)} r={5} fill="#c08a5b" />
            <circle cx={cx} cy={y(s.moon)} r={4} fill="#17140f" stroke="#ece4d6" strokeWidth="1.5" />
            <text x={W} y={-10} textAnchor="end">
              <tspan fill="#c08a5b">— Sun</tspan>
              <tspan dx="18" fill="#ece4d6">— Moon</tspan>
              <tspan dx="18" fill="#c08a5b">▮</tspan>
              <tspan dx="6">Truly dark</tspan>
            </text>
          </svg>
        </div>
      </div>
    </section>
  );
}
