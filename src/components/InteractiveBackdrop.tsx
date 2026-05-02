import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';

const washStyle: CSSProperties = {
  background: `
    radial-gradient(36rem circle at var(--spot-x,72%) var(--spot-y,28%), rgba(107, 108, 255, 0.18), transparent 55%),
    radial-gradient(24rem circle at 82% 18%, rgba(255, 255, 255, 0.92), transparent 60%),
    radial-gradient(28rem circle at 18% 78%, rgba(52, 211, 153, 0.11), transparent 58%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(248, 250, 252, 0.72))
  `,
};

const darkWashStyle: CSSProperties = {
  background: `
    radial-gradient(38rem circle at var(--spot-x,72%) var(--spot-y,28%), rgba(99, 102, 241, 0.24), transparent 58%),
    radial-gradient(24rem circle at 82% 18%, rgba(15, 23, 42, 0.8), transparent 60%),
    radial-gradient(28rem circle at 18% 78%, rgba(16, 185, 129, 0.12), transparent 58%),
    linear-gradient(180deg, rgba(2, 6, 23, 0.88), rgba(15, 23, 42, 0.76))
  `,
};

const dotsStyle: CSSProperties = {
  backgroundImage: 'radial-gradient(circle, rgba(15, 23, 42, 0.14) 1px, transparent 1.2px)',
  backgroundSize: '16px 16px',
  maskImage: 'radial-gradient(circle at center, black 18%, transparent 82%)',
  WebkitMaskImage: 'radial-gradient(circle at center, black 18%, transparent 82%)',
};

const darkDotsStyle: CSSProperties = {
  backgroundImage: 'radial-gradient(circle, rgba(148, 163, 184, 0.16) 1px, transparent 1.2px)',
  backgroundSize: '16px 16px',
  maskImage: 'radial-gradient(circle at center, black 18%, transparent 82%)',
  WebkitMaskImage: 'radial-gradient(circle at center, black 18%, transparent 82%)',
};

export default function InteractiveBackdrop() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = rootRef.current;
    if (!element) {
      return;
    }

    let frame = 0;
    let currentX = 72;
    let currentY = 28;
    let targetX = 72;
    let targetY = 28;

    const animate = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      element.style.setProperty('--spot-x', `${currentX}%`);
      element.style.setProperty('--spot-y', `${currentY}%`);
      frame = window.requestAnimationFrame(animate);
    };

    const handlePointerMove = (event: PointerEvent) => {
      targetX = (event.clientX / window.innerWidth) * 100;
      targetY = (event.clientY / window.innerHeight) * 100;
    };

    frame = window.requestAnimationFrame(animate);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 dark:hidden" style={washStyle} />
      <div className="absolute inset-0 hidden dark:block" style={darkWashStyle} />
      <div className="absolute -left-16 top-8 h-64 w-64 rounded-full bg-white/75 blur-3xl animate-[hero-drift_18s_ease-in-out_infinite] dark:hidden" />
      <div className="absolute -left-16 top-8 hidden h-64 w-64 rounded-full bg-white/8 blur-3xl animate-[hero-drift_18s_ease-in-out_infinite] dark:block" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-primary/8 blur-3xl animate-[hero-drift_22s_ease-in-out_infinite_reverse] dark:bg-primary/16" />
      <div className="absolute inset-y-[6%] right-[3%] hidden w-[42%] lg:block dark:hidden" style={dotsStyle} />
      <div className="absolute inset-y-[6%] right-[3%] hidden w-[42%] dark:lg:block" style={darkDotsStyle} />
    </div>
  );
}