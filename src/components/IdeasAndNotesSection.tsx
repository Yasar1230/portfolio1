import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, FlaskConical } from 'lucide-react';
import type { IdeaEntry, NoteEntry } from '../data/portfolioConfig';

gsap.registerPlugin(ScrollTrigger);

interface IdeasAndNotesSectionProps {
  ideasHeading: string;
  ideas: IdeaEntry[];
  notesHeading: string;
  notes: NoteEntry[];
  reducedMotion: boolean;
  onOpenStudioLab: (initialPrompt?: string) => void;
}

export function IdeasAndNotesSection({
  ideasHeading,
  ideas,
  notesHeading,
  notes,
  reducedMotion,
  onOpenStudioLab,
}: IdeasAndNotesSectionProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (reducedMotion || !wrapperRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-idea-card]',
        { y: 12, opacity: 0.9 },
        {
          y: 0,
          opacity: 1,
          duration: 0.45,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '#ideas',
            start: 'top 96%',
            once: true,
          },
        },
      );

      gsap.fromTo(
        '[data-note-row]',
        { y: 10, opacity: 0.9 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.06,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '#notes',
            start: 'top 96%',
            once: true,
          },
        },
      );
    }, wrapperRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <div ref={wrapperRef}>
      {/* IDEAS SECTION — Open Architectural Drafting Table */}
      <section
        id="ideas"
        aria-labelledby="ideas-heading"
        className="py-20 sm:py-28 lg:py-32 drafting-grid-bg border-b border-[#D4D8E0] dark:border-[#252A34]"
      >
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-5 space-y-5">
              <p className="font-mono text-xs text-[#C23B12] dark:text-[#FF7147] tabular-nums">
                03. Future Exploration
              </p>
              <h2
                id="ideas-heading"
                className="font-display font-semibold tracking-[-0.03em] leading-[1.03] text-[clamp(2.25rem,4.2vw,3.75rem)] text-[#0F1115] dark:text-[#F2F4F7]"
              >
                {ideasHeading}
              </h2>
              <p className="text-base leading-relaxed text-[#4B5362] dark:text-[#A1A9B8] max-w-md">
                Concepts and planned systems currently between sketch and workbench.
              </p>

              {/* Integrated Engineering Studio Lab Trigger */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => onOpenStudioLab()}
                  className="inline-flex items-center gap-2.5 px-4 py-2.5 min-h-[44px] border border-[#0F1115]/25 dark:border-[#F2F4F7]/25 bg-[#F3F4F6] dark:bg-[#0D0F12] text-sm font-medium text-[#0F1115] dark:text-[#F2F4F7] hover:border-[#E84C1E] dark:hover:border-[#FF5A2B] transition-colors whitespace-nowrap"
                >
                  <FlaskConical className="w-4 h-4 text-[#E84C1E] dark:text-[#FF5A2B]" aria-hidden="true" />
                  <span>Open Engineering Studio Lab</span>
                </button>
              </div>
            </div>

            {/* Asymmetric Open Drafting Sheet Ledger (No Rounded Card Clones) */}
            <div className="lg:col-span-7 space-y-10 lg:pt-4">
              {ideas.map((idea, index) => (
                <article
                  key={idea.id}
                  data-idea-card
                  className={`relative border-t border-b border-[#0F1115]/20 dark:border-[#F2F4F7]/20 bg-[#F3F4F6]/80 dark:bg-[#0D0F12]/80 px-6 sm:px-8 py-7 sm:py-9 ${
                    index === 1 ? 'lg:ml-14' : 'lg:mr-10'
                  }`}
                >
                  {/* Precision Sheet Registration Ticks */}
                  <span aria-hidden="true" className="pointer-events-none absolute -top-px left-0 w-3 h-3 border-t-2 border-l-2 border-[#0F1115] dark:border-[#F2F4F7]" />
                  <span aria-hidden="true" className="pointer-events-none absolute -bottom-px right-0 w-3 h-3 border-b-2 border-r-2 border-[#0F1115] dark:border-[#F2F4F7]" />

                  <div className="flex flex-wrap items-baseline justify-between gap-4 pb-5 border-b border-[#D4D8E0] dark:border-[#252A34]">
                    <span className="font-mono text-xs text-[#687182] dark:text-[#7E8797] tabular-nums">
                      Sheet {idea.index}
                    </span>
                    <span className="font-mono text-xs text-[#C23B12] dark:text-[#FF7147]">
                      Status: {idea.status}
                    </span>
                  </div>

                  <div className="pt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                    <h3 className="font-display text-2xl sm:text-4xl font-semibold tracking-tight text-[#0F1115] dark:text-[#F2F4F7]">
                      {idea.title}
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        onOpenStudioLab(
                          `Explore mechanical architecture and prototyping steps for: ${idea.title}`,
                        )
                      }
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-[#4B5362] dark:text-[#A1A9B8] hover:text-[#E84C1E] dark:hover:text-[#FF5A2B] transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>Brainstorm in Studio Lab</span>
                      <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* NOTES SECTION — Quiet Technical Journal Monograph */}
      <section
        id="notes"
        aria-labelledby="notes-heading"
        className="py-20 sm:py-28 border-b border-[#D4D8E0] dark:border-[#252A34]"
      >
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-4 space-y-3">
              <p className="font-mono text-xs text-[#C23B12] dark:text-[#FF7147] tabular-nums">
                04. Technical Journal
              </p>
              <h2
                id="notes-heading"
                className="font-display font-semibold tracking-[-0.03em] leading-[1.04] text-[clamp(2rem,3.6vw,3.25rem)] text-[#0F1115] dark:text-[#F2F4F7]"
              >
                {notesHeading}
              </h2>
              <p className="text-sm leading-relaxed text-[#4B5362] dark:text-[#A1A9B8] max-w-xs">
                Planned engineering notes documenting thermodynamics, drives, and materials fundamentals.
              </p>
            </div>

            <div className="lg:col-span-8 divide-y divide-[#D4D8E0] dark:divide-[#252A34] border-t border-b border-[#D4D8E0] dark:border-[#252A34]">
              {notes.map((note) => (
                <div
                  key={note.id}
                  data-note-row
                  className="group py-6 sm:py-7 flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 transition-transform duration-200 hover:translate-x-1.5"
                >
                  <div className="flex items-baseline gap-5">
                    <span className="font-mono text-xs text-[#687182] dark:text-[#7E8797] tabular-nums shrink-0">
                      {note.index}
                    </span>
                    <h3 className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-[#0F1115] dark:text-[#F2F4F7] group-hover:text-[#C23B12] dark:group-hover:text-[#FF7147] transition-colors">
                      {note.title}
                    </h3>
                  </div>

                  <span className="font-mono text-xs text-[#687182] dark:text-[#7E8797] sm:pl-4 whitespace-nowrap shrink-0">
                    {note.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
