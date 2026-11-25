import { motion } from 'motion/react';
import { Picture } from '../components/Picture';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="frame wide">
            <Picture name="pleiades" widths={[960, 1600, 2400]} className="fill" sizes="(max-width: 900px) 100vw, 55vw" alt="A sepia photographic plate of the Pleiades star cluster on cream card" />
          </div>
          <div className="caption">
            <span className="label">M45 · Үркер · the Pleiades</span>
            <span className="label">Plate I</span>
          </div>
        </motion.div>
        <div>
          <span className="label">The name</span>
          <h2 className="display" style={{ fontSize: 'clamp(40px, 4.6vw, 76px)', margin: '14px 0 20px' }}>
            Ürker is the Kazakh name for the <em>Pleiades.</em>
          </h2>
          <p style={{ color: 'var(--muted)', maxWidth: '44ch' }}>
            For centuries the cluster told the steppe when to move the herds: its first dawn rising in spring, its evening
            setting before winter. We keep time the same way.
          </p>
          <a className="btn" href="#nights" style={{ marginTop: 20 }}>
            Choose a night ↗
          </a>
        </div>
      </div>
      <p className="wordmark" aria-hidden="true">
        Ürker<span className="dot">.</span>
      </p>
      <div className="footer-meta">
        <p className="disclaimer">
          Ürker is a design concept, not a real business. It is not affiliated with the Fesenkov Astrophysical Institute,
          which runs the actual Assy-Turgen observatory. Imagery and footage were generated for this concept; the sky
          data is real.
        </p>
        <span className="label">
          Design &amp; code —{' '}
          <a href="https://seoshiro.github.io" target="_blank" rel="noreferrer">
            seoshiro ↗
          </a>
          {' · '}
          <a href="https://github.com/seoshiro/urker" target="_blank" rel="noreferrer">
            Source ↗
          </a>
        </span>
      </div>
    </footer>
  );
}
