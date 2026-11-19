import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface CustomCursorProps {
  disabled: boolean;
}

export function CustomCursor({ disabled }: CustomCursorProps) {
  const ringRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const [cursorMode, setCursorMode] = useState<'default' | 'interactive' | 'view'>('default');
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (disabled) {
      setEnabled(false);
      return;
    }

    const finePointer = window.matchMedia('(pointer: fine) and (hover: hover)');
    const updateMatch = () => setEnabled(finePointer.matches);
    updateMatch();
    finePointer.addEventListener('change', updateMatch);
    return () => finePointer.removeEventListener('change', updateMatch);
  }, [disabled]);

  useEffect(() => {
    if (!enabled || !ringRef.current || !dotRef.current) return;

    const ring = ringRef.current;
    const dot = dotRef.current;

    const moveRingX = gsap.quickTo(ring, 'x', { duration: 0.28, ease: 'power3.out' });
    const moveRingY = gsap.quickTo(ring, 'y', { duration: 0.28, ease: 'power3.out' });
    const moveDotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power2.out' });
    const moveDotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power2.out' });

    const onMove = (e: MouseEvent) => {
      ring.style.opacity = '1';
      dot.style.opacity = '1';
      moveRingX(e.clientX);
      moveRingY(e.clientY);
      moveDotX(e.clientX);
      moveDotY(e.clientY);

      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-cursor="view"]')) {
        setCursorMode('view');
      } else if (target?.closest('a, button, [role="button"], input, textarea, select')) {
        setCursorMode('interactive');
      } else {
        setCursorMode('default');
      }
    };

    const onLeave = () => {
      ring.style.opacity = '0';
      dot.style.opacity = '0';
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-40 hidden lg:block">
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-[width,height,background-color,border-color] duration-200 flex items-center justify-center opacity-0 ${
          cursorMode === 'view'
            ? 'w-16 h-16 bg-[#E84C1E] border-[#E84C1E] text-white'
            : cursorMode === 'interactive'
              ? 'w-9 h-9 border-[#E84C1E]/65 bg-transparent'
              : 'w-6 h-6 border-[#0F1115]/35 dark:border-[#F2F4F7]/35'
        }`}
      >
        {cursorMode === 'view' && (
          <span className="font-mono text-[11px] font-medium tracking-tight">View</span>
        )}
      </div>
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#E84C1E] transition-opacity duration-150 opacity-0 ${
          cursorMode === 'view' ? 'scale-0' : 'scale-100'
        }`}
      />
    </div>
  );
}
