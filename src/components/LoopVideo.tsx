import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

/** Muted background loop that only plays while on screen (and never under reduced motion). */
export function LoopVideo({ name, className = 'fill' }: { name: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const v = ref.current;
    if (!v || reduce) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? void v.play().catch(() => {}) : v.pause()), {
      rootMargin: '200px',
    });
    io.observe(v);
    return () => io.disconnect();
  }, [reduce]);

  return (
    <video ref={ref} className={className} muted loop playsInline preload="metadata" poster={`/media/${name}-poster.jpg`} aria-hidden="true">
      <source src={`/media/${name}.webm`} type="video/webm" />
      <source src={`/media/${name}.mp4`} type="video/mp4" />
    </video>
  );
}
