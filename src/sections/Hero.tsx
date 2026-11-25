import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { LoopVideo } from '../components/LoopVideo';
import { moonIllumination, nextAstronomicalDusk, nextCrossing, sunAltitude, localTime } from '../lib/astro';
import { countdown, deg, pct } from '../lib/format';
import { useNow } from '../lib/useNow';

const EASE = [0.22, 1, 0.36, 1] as const;

function Ephemeris() {
  const now = useNow(1000);
  const sun = sunAltitude(now);
  const moon = moonIllumination(now);
  const darkNow = sun < -18;
  const next = darkNow ? nextCrossing(sunAltitude, -18, 'up', now) : nextAstronomicalDusk(now);
  const cells = [
    { k: 'Plateau time', v: localTime(now), live: true },
    { k: 'Sun altitude', v: deg(sun) },
    { k: darkNow ? 'Dawn in' : 'Full dark in', v: next ? countdown(next.valueOf() - now.valueOf()) : '—' },
    { k: 'Moon', v: `${pct(moon.fraction)} ${moon.phase < 0.5 ? 'waxing' : 'waning'}` },
    { k: 'Sky quality', v: 'Bortle 2' },
  ];
  return (
    <div className="ephem" aria-label="Live sky conditions on the plateau">
      {cells.map((c) => (
        <div key={c.k}>
          <span className="label">
            {c.live && <span className="live-dot" aria-hidden="true" />}
            {c.k}
          </span>
          <span className="val">{c.v}</span>
        </div>
      ))}
    </div>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const dim = useTransform(scrollYProgress, [0, 1], [0, 0.6]);
  const lift = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const markX = useTransform(scrollYProgress, [0, 1], ['0%', '-6%']);

  const lines = ['Six cabins,', 'timed to the'];
  return (
    <section ref={ref} className="hero" id="top">
      <motion.div
        className="hero-media grain"
        style={{ scale }}
        initial={{ opacity: 0, scale: 1.12 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.2, ease: EASE }}
      >
        <LoopVideo name="plateau" />
        <div className="hero-shade" />
        <motion.div className="fill" style={{ background: '#17140f', opacity: dim }} />
      </motion.div>

      <motion.div className="hero-inner" style={{ y: lift }}>
        <div className="hero-meta">
          <motion.span className="label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 1 }}>
            A dark-sky residency · Assy plateau, Kazakhstan
          </motion.span>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }}>
            Above Almaty, where the steppe runs out of road and the sky runs out of light. Nights are kept by the moon, not
            the calendar.
          </motion.p>
        </div>
        <div>
          <h1 className="display hero-title">
            {[...lines, null].map((l, i) => (
              <span className="line-mask" key={i}>
                <motion.span
                  initial={{ y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.5 + i * 0.12, duration: 1.2, ease: EASE }}
                >
                  {l ?? <em>moon.</em>}
                </motion.span>
              </span>
            ))}
          </h1>
        </div>
        <motion.p className="wordmark" aria-hidden="true" style={{ x: markX }}>
          {'Ürker'.split('').map((ch, i) => (
            <span className="line-mask" style={{ display: 'inline-block' }} key={i}>
              <motion.span
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                transition={{ delay: 0.9 + i * 0.07, duration: 1.4, ease: EASE }}
              >
                {ch}
              </motion.span>
            </span>
          ))}
        </motion.p>
      </motion.div>
      <div style={{ position: 'absolute', inset: 'auto 0 0' }}>
        <Ephemeris />
      </div>
    </section>
  );
}
