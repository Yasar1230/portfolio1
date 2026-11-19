import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';
import type { ContactLinkItem, NavItem } from '../data/portfolioConfig';
import { getContactHref, isPlaceholderValue } from '../lib/portfolioUtils';
import { Magnetic } from './MagneticButton';

gsap.registerPlugin(ScrollTrigger);

interface ContactAndFooterProps {
  name: string;
  heading: string;
  links: ContactLinkItem[];
  navItems: NavItem[];
  reducedMotion: boolean;
  onNavigate: (href: string) => void;
}

export function ContactAndFooter({
  name,
  heading,
  links,
  navItems,
  reducedMotion,
  onNavigate,
}: ContactAndFooterProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (reducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-contact-reveal]',
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

      gsap.fromTo(
        '[data-signature-path]',
        { strokeDashoffset: 320 },
        {
          strokeDashoffset: 0,
          duration: 1.3,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
            once: true,
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  const emailItem = links.find((l) => l.id === 'email');
  const emailHref = emailItem ? getContactHref(emailItem) : null;

  return (
    <>
      <section
        id="contact"
        ref={sectionRef}
        aria-labelledby="contact-heading"
        className="py-24 sm:py-32 lg:py-36 editorial-grid-bg border-b border-[#D4D8E0] dark:border-[#252A34]"
      >
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end pb-14 sm:pb-20 border-b border-[#D4D8E0] dark:border-[#252A34]">
            <div data-contact-reveal className="lg:col-span-8 space-y-5">
              <p className="font-mono text-xs text-[#C23B12] dark:text-[#FF7147] tabular-nums">
                06. Contact
              </p>
              <h2
                id="contact-heading"
                className="font-display font-bold tracking-[-0.035em] leading-[0.95] text-[clamp(2.75rem,6.8vw,6.25rem)] text-[#0F1115] dark:text-[#F2F4F7]"
              >
                {heading}
              </h2>
            </div>

            {/* Subtle Animated Mechanical Pendulum Signature Mark */}
            <div data-contact-reveal className="lg:col-span-4 flex flex-col lg:items-end gap-5">
              <svg
                viewBox="0 0 160 88"
                className="w-36 h-20 text-[#0F1115] dark:text-[#F2F4F7]"
                aria-hidden="true"
              >
                <path
                  data-signature-path
                  d="M 16 44 A 64 36 0 0 1 144 44"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeDasharray="320"
                  strokeDashoffset="0"
                />
                <line
                  data-signature-path
                  x1="80"
                  y1="10"
                  x2="104"
                  y2="68"
                  stroke="#E84C1E"
                  strokeWidth="1.8"
                  strokeDasharray="320"
                  strokeDashoffset="0"
                />
                <circle cx="80" cy="10" r="3" fill="currentColor" />
                <circle cx="104" cy="68" r="6" fill="#E84C1E" />
              </svg>

              {emailHref ? (
                <Magnetic disabled={reducedMotion}>
                  <a
                    href={emailHref}
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 min-h-[46px] bg-[#E84C1E] hover:bg-[#C93E15] text-white text-sm font-semibold transition-colors whitespace-nowrap"
                  >
                    <span>Send an email</span>
                    <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                  </a>
                </Magnetic>
              ) : (
                <p className="font-mono text-xs text-[#687182] dark:text-[#7E8797] lg:text-right max-w-[26ch]">
                  Open to robotics, electric vehicle, and mechanical design collaborations.
                </p>
              )}
            </div>
          </div>

          {/* Contact Ledger */}
          <div className="divide-y divide-[#D4D8E0] dark:divide-[#252A34]">
            {links.map((item) => {
              const href = getContactHref(item);
              const isPlaceholder = isPlaceholderValue(item.value);

              return (
                <div
                  key={item.id}
                  data-contact-reveal
                  className="py-6 sm:py-7 grid grid-cols-1 sm:grid-cols-12 gap-3 items-baseline"
                >
                  <span className="sm:col-span-3 font-mono text-xs text-[#687182] dark:text-[#7E8797]">
                    {item.label}
                  </span>

                  <div className="sm:col-span-6">
                    {href ? (
                      <a
                        href={href}
                        target={item.kind === 'url' ? '_blank' : undefined}
                        rel={item.kind === 'url' ? 'noopener noreferrer' : undefined}
                        className="inline-flex items-center gap-2 font-display text-xl sm:text-2xl font-semibold tracking-tight text-[#0F1115] dark:text-[#F2F4F7] hover:text-[#E84C1E] dark:hover:text-[#FF5A2B] transition-colors"
                      >
                        <span>{item.value}</span>
                        <ArrowUpRight className="w-5 h-5" aria-hidden="true" />
                      </a>
                    ) : (
                      <span className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-[#4B5362] dark:text-[#A1A9B8]">
                        {item.value}
                      </span>
                    )}
                  </div>

                  <span className="sm:col-span-3 sm:text-right font-mono text-xs text-[#687182] dark:text-[#7E8797]">
                    {isPlaceholder ? 'Destination pending' : 'Direct link'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Connected Minimal Editorial Footer */}
      <footer className="py-12 sm:py-16 bg-[#F3F4F6] dark:bg-[#0D0F12]">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-1">
            <p className="font-display text-lg font-semibold tracking-tight text-[#0F1115] dark:text-[#F2F4F7]">
              {name}
            </p>
            <p className="font-mono text-xs text-[#687182] dark:text-[#7E8797] tabular-nums">
              © {currentYear} {name}. All rights reserved.
            </p>
          </div>

          <nav aria-label="Footer sitemap" className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.href);
                }}
                className="text-sm text-[#4B5362] dark:text-[#A1A9B8] hover:text-[#0F1115] dark:hover:text-[#F2F4F7] transition-colors whitespace-nowrap"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </>
  );
}
