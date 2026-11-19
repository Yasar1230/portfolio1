import { useEffect, useState } from 'react';
import gsap from 'gsap';

interface PreloaderProps {
  name: string;
  skip: boolean;
  onComplete: () => void;
}

export function Preloader({ name, skip, onComplete }: PreloaderProps) {
  const [percent, setPercent] = useState(skip ? 100 : 0);
  const [visible, setVisible] = useState(!skip);

  useEffect(() => {
    if (skip) {
      setVisible(false);
      onComplete();
      return;
    }

    const state = { value: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        setVisible(false);
        onComplete();
      },
    });

    tl.to(state, {
      value: 100,
      duration: 0.65,
      ease: 'power3.inOut',
      onUpdate: () => {
        setPercent(Math.round(state.value));
      },
    }).to(
      '[data-preloader-curtain]',
      {
        yPercent: -100,
        duration: 0.52,
        ease: 'expo.inOut',
      },
      '+=0.08',
    );

    return () => {
      tl.kill();
    };
  }, [skip, onComplete]);

  if (!visible) return null;

  return (
    <div
      data-preloader-curtain
      role="status"
      aria-live="polite"
      aria-label="Loading portfolio"
      className="fixed inset-0 z-50 flex flex-col justify-between bg-[#0F1115] text-[#F2F4F7] px-6 sm:px-12 py-10"
    >
      <div className="flex items-center justify-between text-xs font-mono text-[#A1A9B8]">
        <span>{name}</span>
        <span>Mechanical Engineering Portfolio</span>
      </div>

      <div className="max-w-3xl">
        <p className="text-xs font-mono text-[#A1A9B8] mb-3">
          Preparing sequence
        </p>
        <div className="flex items-baseline gap-4">
          <span className="font-display text-6xl sm:text-8xl font-semibold tracking-tight tabular-nums">
            {String(percent).padStart(2, '0')}
          </span>
          <span className="font-mono text-sm text-[#FF5A2B]">/ 100</span>
        </div>
      </div>

      <div className="w-full">
        <div className="h-[1px] w-full bg-[#252A34] overflow-hidden">
          <div
            className="h-full bg-[#FF5A2B] origin-left transition-transform duration-75"
            style={{ transform: `scaleX(${percent / 100})` }}
          />
        </div>
      </div>
    </div>
  );
}
