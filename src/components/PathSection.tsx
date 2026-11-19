import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { PathMilestone } from '../data/portfolioConfig';

gsap.registerPlugin(ScrollTrigger);

interface PathSectionProps {
  heading: string;
  milestones: PathMilestone[];
  reducedMotion: boolean;
}

export function PathSection({
  heading,
  milestones,
  reducedMotion,
}: PathSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (reducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-path-line]',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '[data-path-timeline]',
            start: 'top 76%',
            end: 'bottom 68%',
            scrub: 0.4,
          },
        },
      );

      gsap.fromTo(
        '[data-path-node]',
        { y: 12, opacity: 0.9 },
        {
          y: 0,
          opacity: 1,
          duration: 0.45,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '[data-path-timeline]',
            start: 'top 96%',
            once: true,
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      id="path"
      ref={sectionRef}
      aria-labelledby="path-heading"
      className="py-20 sm:py-28 lg:py-32 bg-[#EAECEF]/55 dark:bg-[#101318] border-b border-[#D4D8E0] dark:border-[#252A34]"
    >
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Sticky Editorial Title */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-4">
            <p className="font-mono text-xs text-[#C23B12] dark:text-[#FF7147] tabular-nums">
              05. Progression
            </p>
            <h2
              id="path-heading"
              className="font-display font-semibold tracking-[-0.03em] leading-[1.03] text-[clamp(2.25rem,4.2vw,3.75rem)] text-[#0F1115] dark:text-[#F2F4F7]"
            >
              {heading}
            </h2>
            <p className="text-base leading-relaxed text-[#4B5362] dark:text-[#A1A9B8] max-w-sm">
              Where the foundation stands today — recorded plainly without padding.
            </p>
          </div>

          {/* Right Vertical Architectural Timeline */}
          <div data-path-timeline className="lg:col-span-7 relative pl-8 sm:pl-12">
            {/* Background Hairline Track */}
            <div
              aria-hidden="true"
              className="absolute left-2.5 sm:left-3.5 top-2 bottom-2 w-px bg-[#D4D8E0] dark:bg-[#252A34]"
            />
            {/* Animated Progression Spine */}
            <div
              aria-hidden="true"
              data-path-line
              className="absolute left-2.5 sm:left-3.5 top-2 bottom-2 w-[2px] -ml-[0.5px] bg-[#E84C1E] dark:bg-[#FF5A2B] origin-top"
            />

            <ol className="space-y-12 sm:space-y-16">
              {milestones.map((milestone, idx) => (
                <li
                  key={milestone.id}
                  data-path-node
                  className="relative"
                >
                  {/* Precision Geometric Calibration Marker (static, no pulsing) */}
                  <span
                    aria-hidden="true"
                    className="absolute -left-[27px] sm:-left-[39px] top-1.5 w-3 h-3 rotate-45 border border-[#E84C1E] dark:border-[#FF5A2B] bg-[#F3F4F6] dark:bg-[#0D0F12]"
                  />

                  <div className="space-y-2 pb-8 border-b border-[#D4D8E0]/80 dark:border-[#252A34]">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-mono text-xs text-[#C23B12] dark:text-[#FF7147]">
                        {milestone.label}
                      </span>
                      <span className="font-mono text-xs text-[#687182] dark:text-[#7E8797] tabular-nums">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <p className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[#0F1115] dark:text-[#F2F4F7]">
                      {milestone.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
