import { useEffect, useState } from 'react';
import { Menu, Moon, Sun, X } from 'lucide-react';
import type { NavItem } from '../data/portfolioConfig';

interface NavigationProps {
  brandName: string;
  items: NavItem[];
  activeSection: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onNavigate: (href: string) => void;
  scrollProgress: number;
}

export function Navigation({
  brandName,
  items,
  activeSection,
  theme,
  onToggleTheme,
  onNavigate,
  scrollProgress,
}: NavigationProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileOpen(false);
    onNavigate(href);
  };

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-30 transition-colors duration-200 ${
          scrolled
            ? 'bg-[#F3F4F6] dark:bg-[#0D0F12] border-b border-[#D4D8E0] dark:border-[#252A34]'
            : 'bg-[#F3F4F6] dark:bg-[#0D0F12] border-b border-transparent'
        }`}
      >
        {/* Scroll Progress Hairline */}
        <div aria-hidden="true" className="h-[2px] w-full bg-transparent overflow-hidden">
          <div
            data-testid="scroll-progress-bar"
            className="h-full bg-[#E84C1E] dark:bg-[#FF5A2B] origin-left"
            style={{ transform: `scaleX(${scrollProgress})` }}
          />
        </div>

        {/* Strict 3-zone Top Bar Contract */}
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 h-14 sm:h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <a
            href="#top"
            onClick={(e) => handleLinkClick(e, '#top')}
            className="font-display text-base sm:text-lg font-semibold tracking-tight text-[#0F1115] dark:text-[#F2F4F7] whitespace-nowrap shrink-0"
          >
            {brandName}
          </a>

          {/* Zone 2: Clean Single-Line Navigation Links */}
          <nav
            aria-label="Primary"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#4B5362] dark:text-[#A1A9B8]"
          >
            {items.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  data-active={isActive ? 'true' : 'false'}
                  onClick={(e) => handleLinkClick(e, item.href)}
                  className={`nav-underline transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'text-[#0F1115] dark:text-[#F2F4F7]'
                      : 'hover:text-[#0F1115] dark:hover:text-[#F2F4F7]'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Zone 3: Theme Toggle (Desktop) & Mobile Menu Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="inline-flex items-center gap-2 px-3 py-2 min-h-[40px] rounded-md border border-[#D4D8E0] dark:border-[#252A34] bg-[#FFFFFF] dark:bg-[#14171D] text-xs font-medium text-[#0F1115] dark:text-[#F2F4F7] hover:border-[#0F1115] dark:hover:border-[#F2F4F7] transition-colors whitespace-nowrap shrink-0"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-[#FF5A2B]" aria-hidden="true" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#C23B12]" aria-hidden="true" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation-drawer"
              aria-label="Open navigation menu"
              className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-md border border-[#D4D8E0] dark:border-[#252A34] bg-[#FFFFFF] dark:bg-[#14171D] text-[#0F1115] dark:text-[#F2F4F7]"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div
          id="mobile-navigation-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className="fixed inset-0 z-40 md:hidden bg-[#F3F4F6] dark:bg-[#0D0F12] flex flex-col justify-between px-6 pt-20 pb-10"
        >
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
            className="absolute top-3.5 right-5 inline-flex items-center justify-center w-11 h-11 rounded-md border border-[#D4D8E0] dark:border-[#252A34] text-[#0F1115] dark:text-[#F2F4F7]"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>

          <nav aria-label="Mobile primary" className="flex flex-col divide-y divide-[#D4D8E0] dark:divide-[#252A34]">
            {items.map((item, idx) => (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => handleLinkClick(e, item.href)}
                className="py-5 flex items-baseline justify-between font-display text-3xl font-semibold tracking-tight text-[#0F1115] dark:text-[#F2F4F7]"
              >
                <span>{item.label}</span>
                <span className="font-mono text-xs text-[#687182] dark:text-[#7E8797] tabular-nums">
                  {String(idx + 1).padStart(2, '0')}
                </span>
              </a>
            ))}
          </nav>

          <div className="pt-6 border-t border-[#D4D8E0] dark:border-[#252A34] flex items-center justify-between text-xs font-mono text-[#4B5362] dark:text-[#A1A9B8]">
            <span>{brandName}</span>
            <span>Engineering of Motion</span>
          </div>
        </div>
      )}
    </>
  );
}
