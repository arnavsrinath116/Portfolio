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
    // the product tile: square face, folded strip on its left, bold "F" top-left
    // (the extrusion supplies the tile's darker side)
    logo: [
      'M26 14 H86 V82 H26 Z',
      'M14 14 H26 V82 L14 72 Z',
      'M36 24 H66 V35 H48 V42 H61 V52 H48 V64 H36 Z',
    ],
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
    // the official mark (outline from Simple Icons, CC0), scaled into the 100 box:
    // the eye, the ring with its three prongs, and the ring's opening
    logo: [
      'M51.95 54.65C52.13 51.59 53.63 48.88 55.9 46.96A13.13 13.13 0 0 1 64.38 43.94C67.64 43.94 70.63 45.09 72.86 46.96C75.13 48.88 76.63 51.59 76.8 54.65C76.97 57.8 75.71 60.73 73.48 62.9A12.99 12.99 0 0 1 64.38 66.5A13.01 13.01 0 0 1 55.27 62.9C53.05 60.73 51.79 57.8 51.96 54.65Z',
      'M32.17 60.85C32.2 62.06 32.58 64.39 33.16 66.21A28.26 28.26 0 0 0 39.26 76.78A31.54 31.54 0 0 0 49.95 84.45A34.3 34.3 0 0 0 63.98 87.36A34.36 34.36 0 0 0 77.99 84.4A31.76 31.76 0 0 0 88.67 76.7A28.47 28.47 0 0 0 94.77 66.11A26.7 26.7 0 0 0 95.73 54.33A27.3 27.3 0 0 0 91.84 43.67A29.76 29.76 0 0 0 84.74 35.84L56 13.77L55.93 13.72C54.04 12.27 50.87 12.28 48.8 13.73C46.7 15.19 46.46 17.62 48.32 19.15L60.3 28.9L23.77 28.94L23.72 28.94C20.7 28.94 17.8 30.93 17.22 33.43C16.63 35.98 18.68 38.1 21.82 38.11L40.34 38.08L7.3 63.44L7.17 63.54C4.05 65.92 3.05 69.89 5.01 72.41C7 74.96 11.24 74.97 14.39 72.42L32.42 57.67S32.16 59.66 32.18 60.85Z',
      'M78.52 67.53C74.8 71.31 69.6 73.46 63.97 73.47C58.34 73.48 53.14 71.35 49.42 67.57A17.29 17.29 0 0 1 45.45 61.35A16.41 16.41 0 0 1 46.53 47.86A18.02 18.02 0 0 1 50.95 42.61C54.56 39.67 59.15 38.07 63.96 38.07C68.78 38.06 73.38 39.64 76.99 42.57C78.83 44.07 80.32 45.84 81.41 47.81A16.41 16.41 0 0 1 83.41 54.35A16.24 16.24 0 0 1 82.49 61.29A17.4 17.4 0 0 1 78.52 67.53Z',
    ],
  },
];
