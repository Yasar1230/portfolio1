import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { HackathonEntry } from '../data/portfolioConfig';

gsap.registerPlugin(ScrollTrigger);

interface HackathonsSectionProps {
  heading: string;
  featured: HackathonEntry;
  others: HackathonEntry[];
  reducedMotion: boolean;
}

export function HackathonsSection({
  heading,
  featured,
  others,
  reducedMotion,
}: HackathonsSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (reducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-hack-reveal]',
        { y: 12, opacity: 0.9 },
        {
          y: 0,
          opacity: 1,
          duration: 0.45,
          stagger: 0.07,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
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
      id="hackathons"
      ref={sectionRef}
      aria-labelledby="hackathons-heading"
      className="py-20 sm:py-28 lg:py-32 bg-[#11141A] dark:bg-[#14171D] text-[#F2F4F7] border-b border-[#252A34]"
    >
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div
          data-hack-reveal
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-[#252A34]"
        >
          <div className="space-y-3">
            <p className="font-mono text-xs text-[#FF7147] tabular-nums">
              02. Hackathons & Achievements
            </p>
            <h2
              id="hackathons-heading"
              className="font-display font-semibold tracking-[-0.03em] leading-[1.02] text-[clamp(2.25rem,4.5vw,4rem)] text-[#F2F4F7]"
            >
              {heading}
            </h2>
          </div>
          <p className="font-mono text-xs text-[#A1A9B8] max-w-xs">
            Curated record of competitive engineering builds and architecture concepts.
          </p>
        </div>

        {/* Featured Achievement — Monumental Editorial Emphasis */}
        <div
          data-hack-reveal
          className="py-12 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 border-b border-[#252A34]"
        >
          <div className="lg:col-span-4 space-y-4">
            <p className="font-mono text-xs text-[#FF7147]">
              {featured.subtitle} · {featured.category}
            </p>
            <p className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[#F2F4F7] leading-snug">
              {featured.achievement}
            </p>
          </div>

          <div className="lg:col-span-8 flex flex-col justify-between gap-6">
            <h3 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-[-0.025em] leading-[1.12] text-[#F2F4F7]">
              {featured.title}
            </h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-[#A1A9B8] pt-4 border-t border-[#252A34]">
              <span>Result: Winner</span>
              <span aria-hidden="true">/</span>
              <span>Inter-college MSME hackathon</span>
            </div>
          </div>
        </div>

        {/* Other Entries — Clean Ruled Archive */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#252A34]">
          {others.map((entry, idx) => (
            <article
              key={entry.id}
              data-hack-reveal
              className={`py-10 ${idx === 0 ? 'md:pr-10' : 'md:pl-10'} flex flex-col justify-between gap-6`}
            >
              <div className="flex items-center justify-between font-mono text-xs text-[#A1A9B8] tabular-nums">
                <span>Archive {String(idx + 2).padStart(2, '0')}</span>
                <span>{entry.category}</span>
              </div>

              <div className="space-y-3">
                <h3 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[#F2F4F7]">
                  {entry.title}
                </h3>
                <p className="text-base leading-relaxed text-[#A1A9B8]">
                  {entry.subtitle}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
