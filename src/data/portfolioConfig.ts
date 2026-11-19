/**
 * SINGLE EDITABLE PORTFOLIO CONFIGURATION
 * ---------------------------------------------------------------------------
 * Update all personal identity details, project images, and contact links here.
 * Any value starting with "[ADD" is treated as a placeholder until replaced.
 */

export interface NavItem {
  id: string;
  label: string;
  href: string;
}

export interface ProjectEntry {
  id: string;
  index: string;
  title: string;
  summary: string;
  team?: string;
  event?: string;
  status: 'In progress';
  caseStudyLabel: string;
  /** Place a real photograph path in /public (e.g. "/projects/spherobot.jpg") when available. */
  imagePath: string | null;
  schematicType: 'spherobot' | 'battery-thermal' | 'line-follower';
  layoutVariant: 'asymmetric-left' | 'editorial-split' | 'technical-frame';
}

export interface HackathonEntry {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  featured?: boolean;
  achievement?: string;
}

export interface IdeaEntry {
  id: string;
  index: string;
  title: string;
  status: 'Idea' | 'Planned';
}

export interface NoteEntry {
  id: string;
  index: string;
  title: string;
  status: 'Planned note';
}

export interface PathMilestone {
  id: string;
  label: string;
  description: string;
}

export interface ContactLinkItem {
  id: 'email' | 'linkedin' | 'github';
  label: string;
  value: string;
  kind: 'email' | 'url';
}

export interface PortfolioConfig {
  identity: {
    name: string;
    eyebrow: string;
    headlineLines: [string, string];
    bio: string;
    /** Upload your portrait as public/photo.jpg or update this path. */
    photoPath: string;
    primaryCtaLabel: string;
    secondaryCtaLabel: string;
  };
  navigation: NavItem[];
  sections: {
    projects: {
      heading: string;
      items: ProjectEntry[];
    };
    hackathons: {
      heading: string;
      featured: HackathonEntry;
      others: HackathonEntry[];
    };
    ideas: {
      heading: string;
      items: IdeaEntry[];
    };
    notes: {
      heading: string;
      items: NoteEntry[];
    };
    path: {
      heading: string;
      milestones: PathMilestone[];
    };
    contact: {
      heading: string;
      links: ContactLinkItem[];
    };
  };
}

export const PORTFOLIO_CONFIG: PortfolioConfig = {
  identity: {
    name: '[ADD YOUR NAME]',
    eyebrow: 'Mechanical engineering student',
    headlineLines: ['Designing robots.', 'Engineering electric futures.'],
    bio: 'Second-year mechanical engineering student working toward robotics and electric vehicles. I design, code, and build.',
    photoPath: '/photo.jpg',
    primaryCtaLabel: "Let's talk.",
    secondaryCtaLabel: 'Resume coming soon.',
  },
  navigation: [
    { id: 'projects', label: 'Projects', href: '#projects' },
    { id: 'hackathons', label: 'Hackathons', href: '#hackathons' },
    { id: 'ideas', label: 'Ideas', href: '#ideas' },
    { id: 'notes', label: 'Notes', href: '#notes' },
    { id: 'path', label: 'Path', href: '#path' },
    { id: 'contact', label: 'Contact', href: '#contact' },
  ],
  sections: {
    projects: {
      heading: 'Built, tested, repeated.',
      items: [
        {
          id: 'spherobot',
          index: '01',
          title: 'SpheRobot',
          summary:
            "A pendulum-driven spherical robot built from a research paper, for Techfest's ThetaShift track.",
          team: 'Team of 4',
          event: "Techfest's ThetaShift track",
          status: 'In progress',
          caseStudyLabel: 'Case study coming soon.',
          imagePath: null,
          schematicType: 'spherobot',
          layoutVariant: 'asymmetric-left',
        },
        {
          id: 'battery-pack-thermal-safety',
          index: '02',
          title: 'Battery Pack Thermal Safety',
          summary:
            'Phase change material to absorb heat in an EV battery pack, plus a temperature-triggered eject system for thermal runaway.',
          status: 'In progress',
          caseStudyLabel: 'Case study coming soon.',
          imagePath: null,
          schematicType: 'battery-thermal',
          layoutVariant: 'editorial-split',
        },
        {
          id: 'high-speed-line-follower',
          index: '03',
          title: 'High-Speed Line Follower',
          summary:
            "Fully autonomous, analog sensor array, PID control, custom PCB, BLDC motors, downforce fan, for MIRAI'26.",
          event: "MIRAI'26",
          status: 'In progress',
          caseStudyLabel: 'Case study coming soon.',
          imagePath: null,
          schematicType: 'line-follower',
          layoutVariant: 'technical-frame',
        },
      ],
    },
    hackathons: {
      heading: 'Tested against a deadline.',
      featured: {
        id: 'msme-solar-dryer',
        title:
          'Smart Hybrid Solar Dryer with AI-Based Drying Optimization and Thermal Energy Storage',
        subtitle: 'Featured achievement',
        category: 'Inter-college MSME hackathon',
        featured: true,
        achievement: 'Winner of an inter-college MSME hackathon.',
      },
      others: [
        {
          id: 'convoy',
          title: 'CONVOY',
          subtitle: 'Factory AGV material-flow optimization, hackathon entry.',
          category: 'Hackathon entry',
        },
        {
          id: 'aegisq-core',
          title: 'AegisQ-Core',
          subtitle: 'Rogue access point detector, blueprint.',
          category: 'Blueprint',
        },
      ],
    },
    ideas: {
      heading: 'On the drawing board.',
      items: [
        {
          id: 'circuit-connection-app',
          index: '01',
          title: 'Circuit connection app.',
          status: 'Idea',
        },
        {
          id: 'teleoperated-avatar-robot',
          index: '02',
          title: 'Teleoperated avatar robot.',
          status: 'Planned',
        },
      ],
    },
    notes: {
      heading: 'Learning out loud.',
      items: [
        {
          id: 'four-process-cycle',
          index: '01',
          title: 'Net work in a four-process cycle.',
          status: 'Planned note',
        },
        {
          id: 'duty-classes-drives',
          index: '02',
          title: 'Duty classes and power rating in electrical drives.',
          status: 'Planned note',
        },
        {
          id: 'thermoset-thermoplastic',
          index: '03',
          title: 'Thermoset or thermoplastic.',
          status: 'Planned note',
        },
      ],
    },
    path: {
      heading: 'The path so far.',
      milestones: [
        {
          id: 'present',
          label: 'Present',
          description: 'Mechanical Engineering student, 2nd year.',
        },
        {
          id: 'achievement',
          label: 'Achievement',
          description: 'MSME hackathon winner.',
        },
        {
          id: 'experience',
          label: 'Experience',
          description: 'Internships and experience: nothing yet.',
        },
      ],
    },
    contact: {
      heading: "Let's build something.",
      links: [
        { id: 'email', label: 'Email', value: '[ADD EMAIL]', kind: 'email' },
        { id: 'linkedin', label: 'LinkedIn', value: '[ADD LINKEDIN]', kind: 'url' },
        { id: 'github', label: 'GitHub', value: '[ADD GITHUB]', kind: 'url' },
      ],
    },
  },
};
