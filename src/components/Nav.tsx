import { useEffect, useRef, useState } from 'react';
import { createDrone, type Drone } from '../lib/drone';

export function Nav() {
  const [on, setOn] = useState(false);
  const drone = useRef<Drone | null>(null);

  useEffect(() => () => drone.current?.dispose(), []);

  const toggle = () => {
    drone.current ??= createDrone();
    drone.current.setOn(!on);
    setOn(!on);
  };

  return (
    <header className="nav">
      <a className="brand" href="#top" aria-label="Ürker, back to top">
        Ürker<span className="dot">.</span>
      </a>
      <span className="label nav-center" style={{ color: 'inherit' }}>
        Iss. 01 · 43°13′N 77°52′E · 2,700 m
      </span>
      <div className="nav-right">
        <button className="label sound" style={{ color: 'inherit' }} aria-pressed={on} onClick={toggle}>
          <span className="sound-bars" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          Wind {on ? 'on' : 'off'}
        </button>
        <a className="label nav-link" style={{ color: 'inherit' }} href="#nights">
          Reserve ↘
        </a>
      </div>
    </header>
  );
}
