import { useCallback, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PORTFOLIO_CONFIG } from './data/portfolioConfig';
import { Navigation } from './components/Navigation';
import { Preloader } from './components/Preloader';
import { CustomCursor } from './components/CustomCursor';
import { HeroSection } from './components/HeroSection';
import { ProjectsSection } from './components/ProjectsSection';
import { HackathonsSection } from './components/HackathonsSection';
import { IdeasAndNotesSection } from './components/IdeasAndNotesSection';
import { PathSection } from './components/PathSection';
import { ContactAndFooter } from './components/ContactAndFooter';
import { EngineeringStudioLab } from './components/EngineeringStudioLab';

gsap.registerPlugin(ScrollTrigger);

function getInitialTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = localStorage.getItem('portfolio-theme');
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {
    // ignore storage errors
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function shouldAutostart(): boolean {
  if (typeof window === 'undefined') return true;
  const params = new URLSearchParams(window.location.search);
  return params.get('autostart') === '1';
}

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);
  const [reducedMotion, setReducedMotion] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );
  const [preloaderDone, setPreloaderDone] = useState<boolean>(
    () => shouldAutostart() || reducedMotion,
  );
  const [activeSection, setActiveSection] = useState<string>('projects');
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [labOpen, setLabOpen] = useState<boolean>(false);
  const [labPrompt, setLabPrompt] = useState<string>('');

  const lenisRef = useRef<Lenis | null>(null);
  const scrollProgressRef = useRef<number>(0);

  // Sync theme to documentElement + localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('portfolio-theme', theme);
    } catch {
      // ignore storage failures
    }
  }, [theme]);

  // Listen to prefers-reduced-motion changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Integrated Lenis + GSAP ScrollTrigger smooth scroll engine
  useEffect(() => {
    if (reducedMotion) {
      lenisRef.current = null;
      return;
    }

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const onTick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion]);

  // Scroll progress tracking (updates ref continuously and state cleanly)
  useEffect(() => {
    let rafId = 0;
    const updateProgress = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const ratio = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
      scrollProgressRef.current = ratio;
      setScrollProgress(ratio);
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Active section observer for navigation indicator
  useEffect(() => {
    const sectionIds = PORTFOLIO_CONFIG.navigation.map((n) => n.id);
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: '-28% 0px -45% 0px', threshold: [0.1, 0.35, 0.6] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleNavigate = useCallback(
    (href: string) => {
      const id = href.replace(/^#/, '');
      const target = id === 'top' ? document.body : document.getElementById(id);
      if (!target) return;

      if (lenisRef.current && !reducedMotion) {
        lenisRef.current.scrollTo(target, { offset: id === 'top' ? 0 : -64 });
      } else {
        target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
      }
    },
    [reducedMotion],
  );

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const handleOpenLab = useCallback((initial = '') => {
    setLabPrompt(initial);
    setLabOpen(true);
  }, []);

  const handlePreloaderComplete = useCallback(() => {
    setPreloaderDone(true);
    ScrollTrigger.refresh();
  }, []);

  const { identity, navigation, sections } = PORTFOLIO_CONFIG;

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#0F1115] dark:bg-[#0D0F12] dark:text-[#F2F4F7]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-md focus:bg-[#E84C1E] focus:text-white focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>

      <Preloader
        name={identity.name}
        skip={shouldAutostart() || reducedMotion}
        onComplete={handlePreloaderComplete}
      />

      <CustomCursor disabled={reducedMotion} />

      <Navigation
        brandName={identity.name}
        items={navigation}
        activeSection={activeSection}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onNavigate={handleNavigate}
        scrollProgress={scrollProgress}
      />

      <main id="main-content">
        <HeroSection
          identity={identity}
          theme={theme}
          reducedMotion={reducedMotion}
          ready={preloaderDone}
          scrollProgressRef={scrollProgressRef}
          onNavigateContact={() => handleNavigate('#contact')}
        />

        <ProjectsSection
          heading={sections.projects.heading}
          projects={sections.projects.items}
          reducedMotion={reducedMotion}
        />

        <HackathonsSection
          heading={sections.hackathons.heading}
          featured={sections.hackathons.featured}
          others={sections.hackathons.others}
          reducedMotion={reducedMotion}
        />

        <IdeasAndNotesSection
          ideasHeading={sections.ideas.heading}
          ideas={sections.ideas.items}
          notesHeading={sections.notes.heading}
          notes={sections.notes.items}
          reducedMotion={reducedMotion}
          onOpenStudioLab={handleOpenLab}
        />

        <PathSection
          heading={sections.path.heading}
          milestones={sections.path.milestones}
          reducedMotion={reducedMotion}
        />

        <ContactAndFooter
          name={identity.name}
          heading={sections.contact.heading}
          links={sections.contact.links}
          navItems={navigation}
          reducedMotion={reducedMotion}
          onNavigate={handleNavigate}
        />
      </main>

      <EngineeringStudioLab
        open={labOpen}
        initialPrompt={labPrompt}
        onClose={() => setLabOpen(false)}
      />
    </div>
  );
}
