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
  discipline: 'Product' | 'UX' | 'UX/UI' | 'HMI' | 'Research' | 'Interaction';
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
    cover: { src: '/projects/tracker/cover.webp', alt: 'The productivity tracker: a render of the black box with a wood front and two ultrasonic sensor eyes, sound waves rippling out toward its name', focus: '62% 50%' },
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
    // not a design project: a thirteen-person DIP field study of Theyyam, and the documentary I co-led for it
    slug: 'documentary',
    discipline: 'Research',
    title: 'The Man the God Wore',
    note: 'A documentary on Theyyam, written and shot by me',
    summary:
      'A thirteen-person field study of Theyyam in Kannur, Kerala, where a performer becomes a god, told in a report and a film made side by side. My part was the documentary: I wrote it and I shot it.',
    cover: { src: '/projects/theyyam/cover.webp', alt: 'A Theyyam performer led through the fire by two men, sparks rising, the crowd filming on phones' },
    role: 'Documentary co-lead, writer and camera',
    team: '13 people',
    duration: '9 days in the field, 2025–26',
    tools: ['11 iPhones', 'Gimbal', 'Canon EOS R50', 'Canon EOS 500D', 'Sony α7 III', 'GoPro Hero 7'],
    phases: phases(),
    outcome: 'A documentary, a 100-page report and a final presentation for FLAME University’s Discover India Program.',
    learnings: 'What you would do differently next time.',
  },
  {
    // CIID summer school, July 2026: a screenless device for passing notes in class, built in a team of three
    slug: 'blackbox',
    discipline: 'Interaction',
    title: 'BlackBox',
    note: 'Passing notes, without a screen',
    cover: { src: '/projects/blackbox/cover.webp', alt: 'BlackBox: the logo beside a render of the black casing, its lid lifted and the LED matrix lit red inside', focus: '62% 50%' },
    summary: 'A screenless box for passing notes to a friend in class: turn the dial, tap twice, and their box buzzes and lights up red.',
    role: 'MicroPython, electronics, wiring and the laser-cut enclosure',
    team: '3 people',
    duration: '1 week, July 2026',
    tools: ['Arduino Nano ESP32', 'MicroPython', 'ESP-NOW', 'Laser cutting', 'Fusion 360', '3D printing'],
    phases: phases(),
    outcome: 'Two working boxes that send icons to each other over ESP-NOW, shown with a short film at CIID.',
    learnings: 'Define every state up front: the code is the product’s structure, not just its wiring.',
  },
];
