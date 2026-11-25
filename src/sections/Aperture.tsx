import { useEffect, useRef } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react';

/** The dome shutter opens as you scroll: video time is driven by scroll position, eased per frame. */
export function Aperture() {
  const ref = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const target = useRef(0);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const clip = useTransform(scrollYProgress, [0, 0.3], ['inset(18% 22% 18% 22%)', 'inset(0% 0% 0% 0%)']);
  const titleOpacity = useTransform(scrollYProgress, [0.55, 0.8], [0, 1]);
  const titleY = useTransform(scrollYProgress, [0.55, 0.85], [60, 0]);
  const introOpacity = useTransform(scrollYProgress, [0, 0.18, 0.3], [1, 1, 0]);

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    target.current = Math.min(1, Math.max(0, (p - 0.08) / 0.8));
  });

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (reduce) {
      v.addEventListener('loadedmetadata', () => (v.currentTime = v.duration * 0.85), { once: true });
      return;
    }
    let raf = 0;
    let shown = 0;
    const tick = () => {
      shown += (target.current - shown) * 0.12;
      if (v.duration && Math.abs(v.currentTime - shown * v.duration) > 1 / 48) {
        v.currentTime = shown * (v.duration - 0.05);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce]);

  return (
    <section ref={ref} className="aperture" aria-label="The dome">
      <div className="aperture-stage">
        <motion.div className="aperture-media grain" style={{ clipPath: clip }}>
          <video
            ref={video}
            className="fill"
            src="/media/aperture.mp4"
            poster="/media/aperture-poster.jpg"
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
          />
          <div className="fill" style={{ background: 'linear-gradient(0deg, rgba(23,20,15,.85), rgba(23,20,15,0) 55%)' }} />
        </motion.div>
        <motion.span className="label" style={{ position: 'absolute', top: 96, left: 'var(--pad)', opacity: introOpacity }}>
          03 / The dome · scroll to open the shutter
        </motion.span>
        <motion.div className="aperture-copy" style={{ opacity: titleOpacity, y: titleY }}>
          <span className="label">0.6 m reflector · computer-guided mount</span>
          <h2 className="display aperture-title">
            The sky, <em>opened.</em>
          </h2>
          <p style={{ maxWidth: '46ch', margin: '0 auto', color: 'rgba(236,228,214,.8)' }}>
            Each cabin shares the dome on a rota drawn from the night's dark window — the hours when the sun is below −18° and
            the moon is down.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
