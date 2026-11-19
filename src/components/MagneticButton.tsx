import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import gsap from 'gsap';

interface MagneticProps {
  children: ReactNode;
  disabled?: boolean;
  strength?: number;
  className?: string;
}

export function Magnetic({
  children,
  disabled = false,
  strength = 0.22,
  className = '',
}: MagneticProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (disabled || !wrapperRef.current) return;
    if (!window.matchMedia('(pointer: fine) and (hover: hover)').matches) return;

    const el = wrapperRef.current;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3.out' });

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const dx = Math.max(-7, Math.min(7, (e.clientX - (rect.left + rect.width / 2)) * strength));
      const dy = Math.max(-7, Math.min(7, (e.clientY - (rect.top + rect.height / 2)) * strength));
      xTo(dx);
      yTo(dy);
    };

    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [disabled, strength]);

  return (
    <div ref={wrapperRef} className={`inline-block ${className}`}>
      {children}
    </div>
  );
}
