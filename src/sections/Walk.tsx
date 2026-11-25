import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Picture } from '../components/Picture';

export function Walk() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.25, 1]);
  const opacity = useTransform(scrollYProgress, [0.45, 0.8], [0, 1]);
  const y = useTransform(scrollYProgress, [0.45, 0.85], [80, 0]);
  return (
    <section ref={ref} className="walk" aria-label="Moonlight walks">
      <div className="walk-stage">
        <motion.div className="fill grain" style={{ scale }}>
          <Picture name="moonwalk" widths={[960, 1600, 2400]} className="fill" alt="A footpath across moonlit steppe toward a low ridge, mist in the valley" />
          <div className="fill" style={{ background: 'linear-gradient(0deg, rgba(23,20,15,.9), rgba(23,20,15,0) 60%)' }} />
        </motion.div>
        <motion.div className="walk-copy" style={{ opacity, y }}>
          <span className="label">06 / When the moon is full</span>
          <h2 className="display walk-title">
            The telescopes rest. <em>Walk.</em>
          </h2>
          <p>
            Full-moon nights are sold as walks: four kilometres of ridge path, lit well enough to read a map, out to the
            old survey cairn and back before the moon sets.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
