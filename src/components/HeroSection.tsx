import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ArrowDownRight } from 'lucide-react';
import type { PortfolioConfig } from '../data/portfolioConfig';
import { SphereRobotScene } from './SphereRobotScene';
import { Magnetic } from './MagneticButton';

interface HeroSectionProps {
  identity: PortfolioConfig['identity'];
  theme: 'light' | 'dark';
  reducedMotion: boolean;
  ready: boolean;
  scrollProgressRef: React.MutableRefObject<number>;
  onNavigateContact: () => void;
}

export function HeroSection({
  identity,
  theme,
  reducedMotion,
  ready,
  scrollProgressRef,
  onNavigateContact,
}: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [photoLoaded, setPhotoLoaded] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);

  useEffect(() => {
    if (!ready || reducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        '[data-hero-name]',
        { yPercent: 105, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.72 },
      )
        .fromTo(
          '[data-hero-headline-line]',
          { yPercent: 90, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.65, stagger: 0.1 },
          '-=0.38',
        )
        .fromTo(
          '[data-hero-photo]',
          { clipPath: 'inset(0 0 100% 0)', opacity: 0.2 },
          { clipPath: 'inset(0 0 0% 0)', opacity: 1, duration: 0.72, ease: 'expo.out' },
          '-=0.4',
        )
        .fromTo(
          '[data-hero-supporting]',
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55, stagger: 0.08 },
          '-=0.45',
        )
        .fromTo(
          '[data-hero-stage]',
          { scale: 0.96, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.75 },
          '-=0.55',
        );
    }, sectionRef);

    return () => ctx.revert();
  }, [ready, reducedMotion]);

  return (
    <section
      id="top"
      ref={sectionRef}
      aria-label="Introduction"
      className="relative pt-16 sm:pt-18 pb-10 sm:pb-12 editorial-grid-bg border-b border-[#D4D8E0] dark:border-[#252A34] lg:min-h-[calc(100svh)] lg:flex lg:flex-col lg:justify-center"
    >
      <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
        {/* Top Monumental Identity Band */}
        <div className="pt-3 pb-5 border-b border-[#D4D8E0] dark:border-[#252A34] flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="space-y-1.5">
            <p
              data-hero-supporting
              className="text-xs sm:text-sm font-medium text-[#C23B12] dark:text-[#FF7147]"
            >
              {identity.eyebrow}
            </p>
            <div className="overflow-hidden">
              <p
                data-hero-name
                className="font-display font-bold tracking-[-0.03em] leading-[0.94] text-[clamp(2.2rem,4.9vw,4.5rem)] text-[#0F1115] dark:text-[#F2F4F7]"
              >
                {identity.name}
              </p>
            </div>
          </div>

          <p
            data-hero-supporting
            className="font-mono text-xs text-[#687182] dark:text-[#7E8797] tabular-nums pb-1"
          >
            Engineering of Motion · 00
          </p>
        </div>

        {/* Asymmetric Split Composition: Editorial Statement + Portrait Slot | Seamless 3D Mechanical Signature */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 pt-6 sm:pt-8 items-stretch">
          {/* Left 7 Columns: Headline, Bio, Actions, and Embedded Portrait Composition */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-7">
            <div className="space-y-4">
              <h1 className="font-display font-semibold tracking-[-0.03em] leading-[1.03] text-[clamp(2.15rem,3.8vw,3.55rem)] text-[#0F1115] dark:text-[#F2F4F7] max-w-2xl">
                {identity.headlineLines.map((line, index) => (
                  <span key={line} className="block overflow-hidden">
                    <span
                      data-hero-headline-line
                      className={`block ${
                        index === 1 ? 'text-[#4B5362] dark:text-[#A1A9B8]' : ''
                      }`}
                    >
                      {line}
                    </span>
                  </span>
                ))}
              </h1>

              <p
                data-hero-supporting
                className="text-[15px] sm:text-base leading-relaxed text-[#4B5362] dark:text-[#A1A9B8] max-w-[52ch]"
              >
                {identity.bio}
              </p>

              {/* Primary + Honest Secondary Action */}
              <div
                data-hero-supporting
                className="flex flex-wrap items-center gap-3.5 pt-1"
              >
                <Magnetic disabled={reducedMotion}>
                  <button
                    type="button"
                    onClick={onNavigateContact}
                    className="inline-flex items-center gap-2.5 px-6 py-3 min-h-[44px] bg-[#E84C1E] hover:bg-[#C93E15] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>{identity.primaryCtaLabel}</span>
                    <ArrowDownRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </Magnetic>

                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className="inline-flex items-center px-5 py-3 min-h-[44px] border border-[#D4D8E0] dark:border-[#252A34] bg-[#FFFFFF]/80 dark:bg-[#14171D]/80 text-sm font-medium text-[#687182] dark:text-[#7E8797] cursor-not-allowed whitespace-nowrap shrink-0"
                >
                  {identity.secondaryCtaLabel}
                </button>
              </div>
            </div>

            {/* Embedded Asymmetric Portrait Frame — crisp architectural proportion */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-stretch pt-5 border-t border-[#D4D8E0] dark:border-[#252A34]">
              <div
                data-hero-photo
                className="sm:col-span-4 relative aspect-[4/3] sm:aspect-auto sm:h-[176px] overflow-hidden border border-[#D4D8E0] dark:border-[#252A34] bg-[#EAECEF] dark:bg-[#14171D]"
              >
                {!photoFailed && (
                  <img
                    src={identity.photoPath}
                    alt={`${identity.name} portrait`}
                    referrerPolicy="no-referrer"
                    onLoad={() => setPhotoLoaded(true)}
                    onError={() => setPhotoFailed(true)}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                      photoLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                )}

                {(!photoLoaded || photoFailed) && (
                  <div className="absolute inset-0 flex flex-col justify-between p-3 drafting-grid-bg">
                    <div className="flex items-center justify-between font-mono text-[10px] text-[#687182] dark:text-[#7E8797]">
                      <span>Portrait</span>
                      <span>photo.jpg</span>
                    </div>

                    <div className="flex flex-col items-center justify-center my-auto text-center px-2">
                      <svg
                        viewBox="0 0 64 64"
                        className="w-9 h-9 text-[#687182] dark:text-[#7E8797] mb-1.5"
                        aria-hidden="true"
                      >
                        <rect
                          x="6"
                          y="6"
                          width="52"
                          height="52"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeDasharray="3 3"
                        />
                        <line x1="6" y1="6" x2="58" y2="58" stroke="currentColor" strokeWidth="0.9" opacity="0.45" />
                        <line x1="58" y1="6" x2="6" y2="58" stroke="currentColor" strokeWidth="0.9" opacity="0.45" />
                        <circle cx="32" cy="32" r="11" fill="none" stroke="currentColor" strokeWidth="1.2" />
                      </svg>
                      <span className="font-mono text-[10px] text-[#4B5362] dark:text-[#A1A9B8]">
                        public/photo.jpg
                      </span>
                    </div>

                    <div className="font-mono text-[10px] text-[#687182] dark:text-[#7E8797] flex justify-between">
                      <span>Portrait slot</span>
                      <span>Ready</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="sm:col-span-8 flex flex-col justify-between gap-3 sm:pl-3 sm:border-l border-[#D4D8E0]/80 dark:border-[#252A34]">
                <div className="space-y-2">
                  <p className="font-mono text-[11px] text-[#687182] dark:text-[#7E8797]">
                    Discipline
                  </p>
                  <p className="text-sm leading-relaxed text-[#4B5362] dark:text-[#A1A9B8]">
                    Robotics, electric vehicles, mechanical design, automation, and electronics — moving from sketch and analysis to physical prototypes.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-[#0F1115] dark:text-[#F2F4F7] pt-2 border-t border-[#D4D8E0]/70 dark:border-[#252A34]">
                  <span>Design</span>
                  <span aria-hidden="true" className="text-[#C23B12] dark:text-[#FF7147]">·</span>
                  <span>Code</span>
                  <span aria-hidden="true" className="text-[#C23B12] dark:text-[#FF7147]">·</span>
                  <span>Build</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Seamless Architectural Gallery Vitrine (Unboxed 3D Stage with Precision Registration Ticks) */}
          <div
            data-hero-stage
            className="lg:col-span-5 relative flex flex-col border-t border-b lg:border border-[#D4D8E0] dark:border-[#252A34] bg-[#F3F4F6]/60 dark:bg-[#0D0F12]/40 min-h-[390px] lg:min-h-[470px]"
          >
            {/* Precision Corner Crosshair Marks */}
            <span aria-hidden="true" className="pointer-events-none absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 border-[#0F1115] dark:border-[#F2F4F7]" />
            <span aria-hidden="true" className="pointer-events-none absolute -top-px -right-px w-3 h-3 border-t-2 border-r-2 border-[#0F1115] dark:border-[#F2F4F7]" />
            <span aria-hidden="true" className="pointer-events-none absolute -bottom-px -left-px w-3 h-3 border-b-2 border-l-2 border-[#0F1115] dark:border-[#F2F4F7]" />
            <span aria-hidden="true" className="pointer-events-none absolute -bottom-px -right-px w-3 h-3 border-b-2 border-r-2 border-[#0F1115] dark:border-[#F2F4F7]" />

            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#D4D8E0]/80 dark:border-[#252A34] text-[11px] font-mono text-[#4B5362] dark:text-[#A1A9B8]">
              <span>Spherical Robot · Internal Pendulum</span>
              <span className="text-[#C23B12] dark:text-[#FF7147]">Interactive 3D</span>
            </div>

            <div className="relative flex-1 w-full">
              <SphereRobotScene
                theme={theme}
                reducedMotion={reducedMotion}
                scrollProgressRef={scrollProgressRef}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
