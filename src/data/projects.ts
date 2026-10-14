// Project case studies. Every project follows the Double Diamond:
// Discover → Define (diamond 1: the problem) → Develop → Deliver (diamond 2: the solution).
// PLACEHOLDER content below: replace each project's fields when the real material is ready.

export type PhaseKey = 'discover' | 'define' | 'develop' | 'deliver';

export interface Phase {
  key: PhaseKey;
  title: string;
  /** what this phase is for, shown as the phase's intro line */
  intent: string;
  /** body paragraphs */
  body: string[];
  /** number of media slots to reserve (images / CAD / screens) */
  media: number;
}

export interface Project {
  slug: string;
  discipline: 'Product' | 'UX' | 'UX/UI' | 'HMI';
  title: string;
  /** one line under the title on the work tile */
  note: string;
  /** cover image on the work tile (path under /public); without one the tile shows a dashed placeholder */
  /** focus is the CSS object-position that keeps the subject in frame when the tile crops it */
  cover?: { src: string; alt: string; focus?: string };
  summary: string;
  role: string;
  team: string;
  duration: string;
  tools: string[];
  phases: Phase[];
  outcome: string;
  learnings: string;
}

const phases = (): Phase[] => [
  {
    key: 'discover',
    title: 'Discover',
    intent: 'Understanding the problem space: research, observation and questions.',
    body: ['Research methods, who you spoke to, what you observed and what surprised you.'],
    media: 2,
  },
  {
    key: 'define',
    title: 'Define',
    intent: 'Narrowing down: the insight, the real problem and the brief.',
    body: ['Key insights, the problem statement or "How might we…", and the requirements you set.'],
    media: 1,
  },
  {
    key: 'develop',
    title: 'Develop',
    intent: 'Exploring solutions: ideation, sketches, models and prototypes.',
    body: ['Concepts explored, sketches, CAD iterations and prototypes, and what testing changed.'],
    media: 3,
  },
  {
    key: 'deliver',
    title: 'Deliver',
    intent: 'The final design, how it was tested and what it achieved.',
    body: ['The final solution, the details that matter, and honest results.'],
    media: 2,
  },
];

export const projects: Project[] = [
  {
    slug: 'cooked',
    discipline: 'UX/UI',
    title: 'Cooked',
    note: 'Home chefs, your way',
    cover: { src: '/projects/cooked/cover.webp', alt: 'Cooked: the wordmark beside three app screens' },
    summary: 'An app that lets people outsource cooking without giving up control of their food.',
    role: 'Role TBD',
    team: 'Team TBD',
    duration: '4 months',
    tools: ['Figma', 'FigJam'],
    phases: phases(),
    outcome: 'What happened in the end: results you can honestly state.',
    learnings: 'What you would do differently next time.',
  },
  {
    slug: 'productivity-tracker',
    discipline: 'Product',
    title: 'Productivity tracker',
    note: 'Tinkering with Tech',
    cover: { src: '/projects/tracker/final-1.webp', alt: 'The productivity tracker: a black box with a wood front and two ultrasonic sensor eyes', focus: '50% 42%' },
    summary: 'A desk device that gives students a small physical push to finish their assignments.',
    role: 'Role TBD',
    team: 'Solo',
    duration: '4 months',
    tools: ['ESP32', 'Arduino IDE', 'Fusion 360', 'Laser cutting', '3D printing'],
    phases: phases(),
    outcome: 'What happened in the end: results you can honestly state.',
    learnings: 'What you would do differently next time.',
  },
  {
    slug: 'hmi',
    discipline: 'HMI',
    title: 'HMI project',
    note: 'Controls and the interface between',
    summary: 'One-line summary of the HMI project: what it is and who it is for.',
    role: 'Role TBD',
    team: 'Team TBD',
    duration: 'Duration TBD',
    tools: ['Figma', 'Fusion 360'],
    phases: phases(),
    outcome: 'What happened in the end: results you can honestly state.',
    learnings: 'What you would do differently next time.',
  },
];
