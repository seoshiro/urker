import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Lenis from 'lenis';
import { useReducedMotion } from 'motion/react';
import './styles.css';
import { Nav } from './components/Nav';
import { Hero } from './sections/Hero';
import { Manifesto } from './sections/Manifesto';
import { Tonight } from './sections/Tonight';
import { Aperture } from './sections/Aperture';
import { Cabin } from './sections/Cabin';
import { Calendar } from './sections/Calendar';
import { Walk } from './sections/Walk';
import { Footer } from './sections/Footer';

function App() {
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const lenis = new Lenis({ lerp: 0.085, anchors: true });
    let raf = requestAnimationFrame(function loop(t) {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    });
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, [reduce]);

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Manifesto />
        <Tonight />
        <Aperture />
        <Cabin />
        <Calendar />
        <Walk />
      </main>
      <Footer />
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
