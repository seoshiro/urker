import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Picture } from '../components/Picture';

const ITEMS = [
  ['I', 'A window the size of the wall', 'Square, north-facing, unshuttered. The ridge and the sky are the only furniture that matters.'],
  ['II', 'Red light after dusk', 'Every lamp dims to a dark-adapted red at astronomical twilight, so your eyes keep the faint stars.'],
  ['III', 'A chart for your night', 'Printed each afternoon from the ephemeris: what rises, when the moon sets, how long it stays black.'],
  ['IV', 'Nothing else', 'No television, no signal after 22:00, a stove and a kettle. Breakfast is brought at first light.'],
] as const;

function Parallax({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);
  return (
    <div ref={ref} className={`frame${wide ? ' wide' : ''}`}>
      <motion.div className="fill" style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
}

export function Cabin() {
  return (
    <section className="section" id="cabins">
      <div className="section-head">
        <span className="label">04 / The cabins</span>
        <span className="label">Timber, stone, one lamp</span>
      </div>
      <div className="cabin">
        <div>
          <Parallax wide>
            <Picture name="cabin" widths={[960, 1600, 2400]} sizes="(max-width: 900px) 100vw, 56vw" alt="A dark timber cabin at night: a desk lamp over a star chart and a brass telescope, a square window onto the ridge and the stars" />
          </Parallax>
          <div className="caption">
            <span className="label">Cabin III · facing Polaris</span>
            <span className="label">Fig. 1</span>
          </div>
        </div>
        <div>
          <h2 className="display" style={{ fontSize: 'clamp(40px, 5vw, 84px)' }}>
            Built for the <em>dark</em>, not the view.
          </h2>
          <ul className="list">
            {ITEMS.map(([n, t, d], i) => (
              <motion.li
                key={n}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.08, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="label">{n}</span>
                <div>
                  <b>{t}</b>
                  <p>{d}</p>
                </div>
              </motion.li>
            ))}
          </ul>
          <div className="cabin-brass">
            <Parallax>
              <Picture name="brass" widths={[640, 1200]} sizes="(max-width: 900px) 46vw, 20vw" alt="Close-up of a worn brass setting circle with an engraved degree scale" />
            </Parallax>
            <div className="caption">
              <span className="label">Setting circle</span>
              <span className="label">Fig. 2</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
