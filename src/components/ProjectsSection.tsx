import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { ProjectEntry } from '../data/portfolioConfig';
import { ProjectSchematic } from './ProjectSchematics';

gsap.registerPlugin(ScrollTrigger);

interface ProjectsSectionProps {
  heading: string;
  projects: ProjectEntry[];
  reducedMotion: boolean;
}

export function ProjectsSection({
  heading,
  projects,
  reducedMotion,
}: ProjectsSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (reducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-project-heading]',
        { y: 14, opacity: 0.9 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 95%',
            once: true,
          },
        },
      );

      gsap.fromTo(
        '[data-project-plate]',
        { y: 18, opacity: 0.9 },
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '[data-project-track]',
            start: 'top 95%',
            once: true,
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  const scrollToPlate = (index: number) => {
    const bounded = Math.max(0, Math.min(projects.length - 1, index));
    setActiveIndex(bounded);

    const container = scrollerRef.current;
    if (!container) return;
    const plate = container.querySelector<HTMLElement>(`[data-plate-index="${bounded}"]`);
    if (plate) {
      container.scrollTo({
        left: plate.offsetLeft - container.offsetLeft,
        behavior: reducedMotion ? 'auto' : 'smooth',
      });
    }
  };

  const handleHorizontalScroll = () => {
    const container = scrollerRef.current;
    if (!container) return;
    const width = container.clientWidth || 1;
    const approx = Math.round(container.scrollLeft / (width * 0.8));
    setActiveIndex(Math.max(0, Math.min(projects.length - 1, approx)));
  };

  const handlePlatePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || e.pointerType !== 'mouse') return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const rx = ((e.clientY - rect.top) / rect.height - 0.5) * -3.2;
    const ry = ((e.clientX - rect.left) / rect.width - 0.5) * 3.2;
    card.style.transform = `perspective(1100px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
  };

  const handlePlatePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'perspective(1100px) rotateX(0deg) rotateY(0deg)';
  };

  return (
    <section
      id="projects"
      ref={sectionRef}
      aria-labelledby="projects-heading"
      className="py-20 sm:py-28 lg:py-32 border-b border-[#D4D8E0] dark:border-[#252A34]"
    >
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
        {/* Editorial Exhibition Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 sm:pb-12 border-b border-[#D4D8E0] dark:border-[#252A34]">
          <div data-project-heading className="space-y-3">
            <p className="font-mono text-xs text-[#C23B12] dark:text-[#FF7147] tabular-nums">
              01. Selected Work
            </p>
            <h2
              id="projects-heading"
              className="font-display font-semibold tracking-[-0.03em] leading-[1.02] text-[clamp(2.25rem,4.5vw,4rem)] text-[#0F1115] dark:text-[#F2F4F7]"
            >
              {heading}
            </h2>
          </div>

          {/* Interactive Plate Switcher & Keyboard-Accessible Exhibition Controls (Desktop) */}
          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-4">
            <div
              role="tablist"
              aria-label="Project exhibition selector"
              className="hidden lg:flex items-center gap-1 p-1 bg-[#E7EAEF] dark:bg-[#1B1F27] border border-[#D4D8E0] dark:border-[#252A34]"
            >
              {projects.map((proj, idx) => (
                <button
                  key={proj.id}
                  type="button"
                  role="tab"
                  aria-selected={activeIndex === idx}
                  onClick={() => scrollToPlate(idx)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 tabular-nums ${
                    activeIndex === idx
                      ? 'bg-[#FFFFFF] dark:bg-[#0D0F12] text-[#0F1115] dark:text-[#F2F4F7]'
                      : 'text-[#4B5362] dark:text-[#A1A9B8] hover:text-[#0F1115] dark:hover:text-[#F2F4F7]'
                  }`}
                >
                  {proj.index} · {proj.title}
                </button>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollToPlate(activeIndex - 1)}
                disabled={activeIndex === 0}
                aria-label="Previous project"
                className="inline-flex items-center justify-center w-10 h-10 border border-[#D4D8E0] dark:border-[#252A34] text-[#0F1115] dark:text-[#F2F4F7] disabled:opacity-35 hover:border-[#0F1115] dark:hover:border-[#F2F4F7] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => scrollToPlate(activeIndex + 1)}
                disabled={activeIndex === projects.length - 1}
                aria-label="Next project"
                className="inline-flex items-center justify-center w-10 h-10 border border-[#D4D8E0] dark:border-[#252A34] text-[#0F1115] dark:text-[#F2F4F7] disabled:opacity-35 hover:border-[#0F1115] dark:hover:border-[#F2F4F7] transition-colors"
              >
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Exhibition Track: Clean scrollbar-free horizontal gallery on desktop, vertical plates on mobile/tablet */}
        <div
          ref={scrollerRef}
          data-project-track
          onScroll={handleHorizontalScroll}
          tabIndex={0}
          aria-label="Engineering projects exhibition"
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') scrollToPlate(activeIndex + 1);
            if (e.key === 'ArrowLeft') scrollToPlate(activeIndex - 1);
          }}
          className="mt-10 sm:mt-12 flex flex-col lg:flex-row gap-10 lg:gap-8 lg:overflow-x-auto lg:snap-x lg:snap-mandatory scrollbar-none focus-visible:outline-none"
        >
          {projects.map((project, idx) => (
            <article
              key={project.id}
              data-project-plate
              data-plate-index={idx}
              className="lg:snap-start lg:shrink-0 lg:w-[86%] xl:w-[82%] border border-[#D4D8E0] dark:border-[#252A34] bg-[#FFFFFF] dark:bg-[#14171D] overflow-hidden"
            >
              {project.layoutVariant === 'asymmetric-left' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[450px]">
                  <div
                    data-cursor="view"
                    onPointerMove={handlePlatePointerMove}
                    onPointerLeave={handlePlatePointerLeave}
                    className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[#D4D8E0] dark:border-[#252A34] transition-transform duration-200 will-change-transform"
                  >
                    {project.imagePath ? (
                      <img
                        src={project.imagePath}
                        alt={project.title}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ProjectSchematic type={project.schematicType} title={project.title} />
                    )}
                  </div>
                  <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between gap-8">
                    <div className="flex items-start justify-between gap-4 pb-6 border-b border-[#D4D8E0] dark:border-[#252A34]">
                      <span className="font-display text-5xl sm:text-6xl font-semibold tracking-tight leading-none text-[#0F1115] dark:text-[#F2F4F7] tabular-nums">
                        {project.index}
                      </span>
                      <span className="font-mono text-xs text-[#C23B12] dark:text-[#FF7147] pt-1">
                        {project.status}
                      </span>
                    </div>

                    <div className="space-y-4 my-auto">
                      <h3 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#0F1115] dark:text-[#F2F4F7]">
                        {project.title}
                      </h3>
                      <p className="text-base leading-relaxed text-[#4B5362] dark:text-[#A1A9B8]">
                        {project.summary}
                      </p>
                    </div>

                    <div className="space-y-3 pt-6 border-t border-[#D4D8E0] dark:border-[#252A34]">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-[#0F1115] dark:text-[#F2F4F7]">
                        {project.team && <span>{project.team}</span>}
                        {project.team && project.event && (
                          <span aria-hidden="true" className="text-[#C23B12] dark:text-[#FF7147]">·</span>
                        )}
                        {project.event && <span>{project.event}</span>}
                      </div>
                      <p className="font-mono text-xs text-[#687182] dark:text-[#7E8797]">
                        {project.caseStudyLabel}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {project.layoutVariant === 'editorial-split' && (
                <div className="flex flex-col min-h-[450px]">
                  <div className="p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-end border-b border-[#D4D8E0] dark:border-[#252A34]">
                    <div className="lg:col-span-6 space-y-2">
                      <p className="font-mono text-xs text-[#687182] dark:text-[#7E8797] tabular-nums">
                        Project {project.index} · <span className="text-[#C23B12] dark:text-[#FF7147]">{project.status}</span>
                      </p>
                      <h3 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#0F1115] dark:text-[#F2F4F7]">
                        {project.title}
                      </h3>
                    </div>
                    <div className="lg:col-span-6 space-y-3">
                      <p className="text-base leading-relaxed text-[#4B5362] dark:text-[#A1A9B8]">
                        {project.summary}
                      </p>
                      <p className="font-mono text-xs text-[#687182] dark:text-[#7E8797]">
                        {project.caseStudyLabel}
                      </p>
                    </div>
                  </div>
                  <div
                    data-cursor="view"
                    onPointerMove={handlePlatePointerMove}
                    onPointerLeave={handlePlatePointerLeave}
                    className="flex-1 transition-transform duration-200 will-change-transform"
                  >
                    {project.imagePath ? (
                      <img
                        src={project.imagePath}
                        alt={project.title}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ProjectSchematic type={project.schematicType} title={project.title} />
                    )}
                  </div>
                </div>
              )}

              {project.layoutVariant === 'technical-frame' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[450px]">
                  <div className="lg:col-span-5 order-2 lg:order-1 p-6 sm:p-8 lg:p-10 flex flex-col justify-between gap-8 border-t lg:border-t-0 lg:border-r border-[#D4D8E0] dark:border-[#252A34]">
                    <div className="flex items-start justify-between gap-4 pb-6 border-b border-[#D4D8E0] dark:border-[#252A34]">
                      <span className="font-display text-5xl sm:text-6xl font-semibold tracking-tight leading-none text-[#0F1115] dark:text-[#F2F4F7] tabular-nums">
                        {project.index}
                      </span>
                      <span className="font-mono text-xs text-[#C23B12] dark:text-[#FF7147] pt-1">
                        {project.status}
                      </span>
                    </div>

                    <div className="space-y-4 my-auto">
                      <h3 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#0F1115] dark:text-[#F2F4F7]">
                        {project.title}
                      </h3>
                      <p className="text-base leading-relaxed text-[#4B5362] dark:text-[#A1A9B8]">
                        {project.summary}
                      </p>
                    </div>

                    <div className="space-y-3 pt-6 border-t border-[#D4D8E0] dark:border-[#252A34]">
                      {project.event && (
                        <p className="text-xs font-mono text-[#0F1115] dark:text-[#F2F4F7]">
                          Target event · {project.event}
                        </p>
                      )}
                      <p className="font-mono text-xs text-[#687182] dark:text-[#7E8797]">
                        {project.caseStudyLabel}
                      </p>
                    </div>
                  </div>
                  <div
                    data-cursor="view"
                    onPointerMove={handlePlatePointerMove}
                    onPointerLeave={handlePlatePointerLeave}
                    className="lg:col-span-7 order-1 lg:order-2 transition-transform duration-200 will-change-transform"
                  >
                    {project.imagePath ? (
                      <img
                        src={project.imagePath}
                        alt={project.title}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ProjectSchematic type={project.schematicType} title={project.title} />
                    )}
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>

        {/* Precision Exhibition Progress Rail (Desktop) */}
        <div className="hidden lg:flex items-center justify-between gap-8 mt-8">
          <span className="font-mono text-xs text-[#687182] dark:text-[#7E8797] tabular-nums shrink-0">
            Plate {String(activeIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
          </span>
          <div className="flex-1 h-px bg-[#D4D8E0] dark:bg-[#252A34] relative overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-[#E84C1E] dark:bg-[#FF5A2B] transition-all duration-300"
              style={{
                width: `${((activeIndex + 1) / projects.length) * 100}%`,
              }}
            />
          </div>
          <span className="font-mono text-xs text-[#687182] dark:text-[#7E8797] shrink-0">
            Horizontal gallery · Arrow keys supported
          </span>
        </div>
      </div>
    </section>
  );
}
