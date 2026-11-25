import { useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react';

const TEXT =
  'Six cabins at 2,700 metres, far above the city glow, where the steppe meets a Bortle 2 sky. We keep no standard calendar: nights are allocated by the phase of the moon — the black of the new moon for deep observation, the full moon for slow walks along the silver ridge.';
const ITALIC = new Set(['moon', 'silver']);

function Word({ word, i, n, p }: { word: string; i: number; n: number; p: MotionValue<number> }) {
  const start = (i / n) * 0.88;
  const opacity = useTransform(p, [start, start + 0.12], [0.14, 1]);
  const clean = word.replace(/[^\p{L}]/gu, '');
  return (
    <motion.span style={{ opacity }}>
      {ITALIC.has(clean) ? <em>{word}</em> : word}{' '}
    </motion.span>
  );
}

const FIGURES = [
  { k: 'Altitude', v: '2,700', u: 'm' },
  { k: 'Cabins', v: '6', u: 'only' },
  { k: 'Sky brightness', v: '21.8', u: 'mag/arcsec²' },
  { k: 'Clear nights', v: '~220', u: 'a year' },
];

export function Manifesto() {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 45%'] });
  const words = TEXT.split(' ');
  return (
    <section className="section" id="residency">
      <div className="section-head">
        <span className="label">01 / The residency</span>
        <span className="label">Assy-Turgen plateau</span>
      </div>
      <p ref={ref} className="manifesto">
        {words.map((w, i) => (
          <Word key={i} word={w} i={i} n={words.length} p={scrollYProgress} />
        ))}
      </p>
      <div className="manifesto-foot">
        {FIGURES.map((f, i) => (
          <motion.div
            key={f.k}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay: i * 0.08, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="label">{f.k}</span>
            <span className="figure">
              {f.v}
              <small>{f.u}</small>
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
