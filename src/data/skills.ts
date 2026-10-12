// Software skills. Each opens a card listing the work made with that tool.
// PLACEHOLDER content below: replace `since`, `summary` and `works` when the real material is ready.
// Case studies that list the tool in their `tools` (projects.ts) are linked from the card automatically.

export interface SkillWork {
  title: string;
  /** what kind of piece it is: model, render, poster, prototype… */
  kind: string;
  year: string;
  caption: string;
}

export interface Skill {
  /** used for the card's link: #skill-<slug> */
  slug: string;
  /** must match the name used in a project's `tools` list */
  name: string;
  maker: string;
  /** one line for the tile */
  use: string;
  summary: string;
  since: string;
  works: SkillWork[];
  /**
   * Line-art logo in a 100×100 box, one closed outline per entry. Drawn as a
   * flat outline without JavaScript, extruded into a 3D wireframe with it.
   */
  logo: string[];
}

const work = (kind: string, n: number): SkillWork => ({
  title: `${kind} ${n}`,
  kind,
  year: 'Year TBD',
  caption: 'One line on what this is and what the tool did for it.',
});

export const skills: Skill[] = [
  {
    slug: 'fusion',
    name: 'Fusion 360',
    maker: 'Autodesk',
    use: 'CAD, parametric parts and assemblies',
    summary: 'Parametric modelling for products: from first sketches to parts that can be printed, machined and assembled.',
    since: 'Since TBD',
    works: [work('CAD model', 1), work('Assembly', 2), work('Render', 3), work('Drawing', 4)],
    // a slanted "F"
    logo: ['M28 14 H80 L72 32 H48 V43 H70 L62 61 H48 V86 H28 Z'],
  },
  {
    slug: 'illustrator',
    name: 'Illustrator',
    maker: 'Adobe',
    use: 'Vector graphics, icons and layouts',
    summary: 'Vector work: icons, diagrams, posters and the line drawings that explain how a product works.',
    since: 'Since TBD',
    works: [work('Poster', 1), work('Icon set', 2), work('Diagram', 3), work('Layout', 4)],
    // rounded tile with "Ai"
    logo: [
      'M28 12 H72 A16 16 0 0 1 88 28 V72 A16 16 0 0 1 72 88 H28 A16 16 0 0 1 12 72 V28 A16 16 0 0 1 28 12 Z',
      'M27 69 L39 32 H48 L60 69 H52 L49 59 H38 L35 69 Z',
      'M40 52 H47 L43.5 40 Z',
      'M64 45 H72 V69 H64 Z',
      'M64 32 H72 V40 H64 Z',
    ],
  },
  {
    slug: 'figma',
    name: 'Figma',
    maker: 'Figma',
    use: 'Interfaces, flows and prototypes',
    summary: 'Interface design: user flows, screens, components and clickable prototypes for testing with people.',
    since: 'Since TBD',
    works: [work('Prototype', 1), work('Screens', 2), work('User flow', 3), work('Components', 4)],
    // the five-part mark
    logo: [
      'M50 15 H39 A11 11 0 0 0 39 37 H50 Z',
      'M50 15 H61 A11 11 0 0 1 61 37 H50 Z',
      'M50 39 H39 A11 11 0 0 0 39 61 H50 Z',
      'M72 50 A11 11 0 1 1 50 50 A11 11 0 1 1 72 50 Z',
      'M50 63 H39 A11 11 0 1 0 50 74 Z',
    ],
  },
  {
    slug: 'blender',
    name: 'Blender',
    maker: 'Blender Foundation',
    use: 'Rendering, surfaces and motion',
    summary: 'Rendering and visualisation: materials, lighting and short animations that show a product in use.',
    since: 'Since TBD',
    works: [work('Render', 1), work('Animation', 2), work('Material study', 3), work('Scene', 4)],
    // the ring with its three prongs, and the eye inside
    logo: [
      'M60 32 A26 26 0 1 1 42 77 L29 85 Q24 87 25 82 L33 67 L22 62 Q17 58 22 55 L35 49 L14 47 Q8 46 9 41.5 Q10 37 15 37 L46 36 Q52 32 60 32 Z',
      'M76 58 A16 16 0 1 1 44 58 A16 16 0 1 1 76 58 Z',
      'M69 58 A9 9 0 1 1 51 58 A9 9 0 1 1 69 58 Z',
    ],
  },
];
