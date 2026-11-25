import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { MoonGlyph } from '../components/MoonGlyph';
import { localTime } from '../lib/astro';
import { hm, kzt, pct } from '../lib/format';
import { CABINS, NIGHT_KINDS, upcomingNights, type Night } from '../lib/nights';

const DAYS = 42;
const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const fmtDate = (key: string) =>
  new Date(`${key}T00:00:00Z`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });

export function Calendar() {
  const nights = useMemo(() => upcomingNights(new Date(), DAYS), []);
  const [selected, setSelected] = useState<Night>(
    () => nights.find((n) => n.kind === 'dark' && n.cabinsLeft > 0) ?? nights[0],
  );
  const [held, setHeld] = useState<string | null>(null);
  const lead = (new Date(`${nights[0].date}T00:00:00Z`).getUTCDay() + 6) % 7;
  const info = NIGHT_KINDS[selected.kind];

  return (
    <section className="section paper" id="nights">
      <div className="section-head">
        <span className="label">05 / Nights, by moon</span>
        <span className="label">Next {DAYS} nights · {CABINS} cabins</span>
      </div>
      <div className="cal-wrap">
        <div>
          <div className="legend">
            {(Object.keys(NIGHT_KINDS) as (keyof typeof NIGHT_KINDS)[]).map((k) => (
              <span key={k} className="label">
                <i className={`swatch ${k}`} aria-hidden="true" />
                {NIGHT_KINDS[k].label} · {kzt(NIGHT_KINDS[k].priceKzt)}
              </span>
            ))}
          </div>
          <div className="cal" role="grid" aria-label="Available nights">
            {DOW.map((d) => (
              <div key={d} className="cal-dow label" role="columnheader">
                {d}
              </div>
            ))}
            {Array.from({ length: lead }, (_, i) => (
              <div key={`pad${i}`} className="cell" aria-hidden="true" />
            ))}
            {nights.map((n, i) => {
              const day = Number(n.date.slice(8));
              const full = n.cabinsLeft === 0;
              return (
                <motion.button
                  key={n.date}
                  className={`cell ${n.kind}`}
                  aria-pressed={selected.date === n.date}
                  aria-label={`${fmtDate(n.date)}: ${NIGHT_KINDS[n.kind].label}, ${full ? 'full' : `${n.cabinsLeft} cabins left`}`}
                  disabled={full}
                  onClick={() => {
                    setSelected(n);
                    setHeld(null);
                  }}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: full ? 0.35 : 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: (i % 14) * 0.025, duration: 0.6 }}
                >
                  <span className="day">
                    {day === 1 || i === 0
                      ? `${day} ${new Date(`${n.date}T00:00:00Z`).toLocaleString('en-GB', { month: 'short', timeZone: 'UTC' })}`
                      : day}
                  </span>
                  <MoonGlyph phase={n.phase} />
                  <span className="left">{full ? 'Full' : `${n.cabinsLeft}/${CABINS} left`}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <aside className="detail" aria-live="polite">
          <span className="label">{fmtDate(selected.date)}</span>
          <AnimatePresence mode="wait">
            <motion.div
              key={selected.date}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <h3 className="display detail-title">
                {info.label.split(' ')[0]} <em>{info.label.split(' ').slice(1).join(' ') || 'night'}</em>
              </h3>
              <p style={{ margin: 0 }}>{info.note}</p>
              <dl>
                <div>
                  <dt className="label">Moon lit</dt>
                  <dd>{pct(selected.fraction)}</dd>
                </div>
                <div>
                  <dt className="label">Cabins left</dt>
                  <dd>
                    {selected.cabinsLeft} of {CABINS}
                  </dd>
                </div>
                <div>
                  <dt className="label">Dark window</dt>
                  <dd>{selected.dark ? `${localTime(selected.dark.start)}–${localTime(selected.dark.end)}` : 'None'}</dd>
                </div>
                <div>
                  <dt className="label">Truly dark for</dt>
                  <dd>{selected.dark ? hm(selected.dark.minutes) : 'Moon up all night'}</dd>
                </div>
                <div>
                  <dt className="label">Per cabin</dt>
                  <dd>{kzt(selected.priceKzt)}</dd>
                </div>
                <div>
                  <dt className="label">Check-in</dt>
                  <dd>16:00</dd>
                </div>
              </dl>
            </motion.div>
          </AnimatePresence>
          <button className="btn btn-solid" onClick={() => setHeld(selected.date)} disabled={held === selected.date}>
            {held === selected.date ? 'Held ✓' : 'Hold this night →'}
          </button>
          <p className="note">
            {held === selected.date
              ? 'Held for 15 minutes. Ürker is a concept, so nothing is booked or charged.'
              : 'Moon phase, dark window and prices are computed live; occupancy is simulated.'}
          </p>
        </aside>
      </div>
    </section>
  );
}
