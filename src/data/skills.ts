// Skills: what I can do, not the software. Each opens a card with the work, and names
// the tools behind it. PLACEHOLDER content below: replace `since`, `summary` and the
// placeholder `works` when the real material is ready.
// Case studies whose `tools` (projects.ts) include one of a skill's tools are linked from its card automatically.

export interface SkillWork {
  title: string;
  /** what kind of piece it is: model, render, poster, prototype… */
  kind: string;
  year: string;
  caption: string;
  /** a 3D model shown in an interactive viewer in place of an image */
  model?: SkillModel;
  /** not made yet: shown as a dashed "In drafting" sheet, without year or caption */
  pending?: boolean;
}

export interface SkillModel {
  /** Draco-compressed GLB in /public/models, centred and scaled to fit a 2-unit box */
  src: string;
  /** overall size of the real part, in mm (x × y × z) */
  size: [number, number, number];
  parts: number;
  /** open with a section cut through the long axis, so the inside shows */
  section?: boolean;
  /** parts (by name, as exported from Fusion) that an Opacity button turns see-through */
  fade?: string[];
}

/** a piece of gear, drawn as line art on the skill's card */
export interface KitItem {
  name: string;
  /** which drawing to show (see CameraKit.astro) */
  art: 'iphone-15' | 'eos-500d';
}

export interface Skill {
  /** used for the card's link: #skill-<slug> */
  slug: string;
  name: string;
  /** the software behind the skill; a case study using any of these is linked from the card */
  tools: string[];
  /** one line for the tile */
  use: string;
  /** one line; wrap a key word or two in *asterisks* to set them in the accent colour */
  summary: string;
  since: string;
  works: SkillWork[];
  /** gear drawn on the card, for skills where the equipment matters */
  kit?: KitItem[];
  /**
   * Line-art icon in a 100×100 box, one closed outline per entry. Drawn as a
   * flat outline without JavaScript, extruded into a 3D wireframe with it.
   */
  logo: string[];
}

// a slot for a piece still to come
const work = (kind: string): SkillWork => ({ title: kind, kind, year: '', caption: '', pending: true });

export const skills: Skill[] = [
  {
    slug: '3d-modeling',
    name: '3D modeling',
    tools: ['Fusion 360', 'Blender'],
    use: 'CAD parts, assemblies and renders',
    summary: 'Parametric CAD, from a first sketch to parts that *print and fit*.',
    since: 'Since TBD',
    // the first three are exported from the Fusion designs (visible bodies only), reduced and compressed for the web
    works: [
      {
        title: 'Turbojet engine',
        kind: 'Assembly',
        year: 'Year TBD',
        caption: 'Modelled part by part, intake to exhaust; shown in section.',
        model: { src: '/models/jet.glb', size: [1330.8, 667.9, 667.7], parts: 38, section: true },
      },
      {
        title: 'Piston and connecting rod',
        kind: 'Assembly',
        year: 'Year TBD',
        caption: 'Piston, rod and gudgeon pin, modelled to fit together.',
        model: { src: '/models/piston.glb', size: [50, 105, 81.4], parts: 3 },
      },
      {
        title: 'BlackBox casing',
        kind: 'Enclosure',
        year: 'Year TBD',
        caption: 'A printed enclosure with a display holder and mounts inside.',
        model: { src: '/models/blackbox.glb', size: [64, 64, 72], parts: 6, fade: ['Shell', 'Lid'] },
      },
      work('Render'),
      work('Animation'),
      work('Material study'),
    ],
    // an isometric cube: top, left and right faces
    logo: ['M50 12 L84 31 L50 50 L16 31 Z', 'M16 31 L50 50 V88 L16 69 Z', 'M84 31 V69 L50 88 V50 Z'],
  },
  {
    slug: 'ui-design',
    name: 'UI design',
    tools: ['Figma', 'FigJam'],
    use: 'Interfaces, flows and prototypes',
    summary: 'Flows, screens and *clickable prototypes*.',
    since: 'Since TBD',
    works: [work('Prototype'), work('Screens'), work('User flow'), work('Components')],
    // a phone screen laid out: header, card, button
    logo: [
      'M32 8 H68 A9 9 0 0 1 77 17 V83 A9 9 0 0 1 68 92 H32 A9 9 0 0 1 23 83 V17 A9 9 0 0 1 32 8 Z',
      'M31 20 H69 V30 H31 Z',
      'M31 36 H69 V60 H31 Z',
      'M39 70 H61 A5 5 0 0 1 61 80 H39 A5 5 0 0 1 39 70 Z',
    ],
  },
  {
    slug: 'graphic-design',
    name: 'Graphic design',
    tools: ['Illustrator'],
    use: 'Posters, icons, diagrams and layouts',
    summary: 'Posters, icons and diagrams that *explain* how things work.',
    since: 'Since TBD',
    works: [work('Poster'), work('Icon set'), work('Diagram'), work('Layout')],
    // a pen nib with its breather hole, on its holder
    logo: ['M50 8 L75 44 L63 76 H37 L25 44 Z', 'M54.5 46 A4.5 4.5 0 1 1 45.5 46 A4.5 4.5 0 1 1 54.5 46 Z', 'M35 80 H65 V92 H35 Z'],
  },
  {
    slug: 'photography',
    name: 'Photography',
    tools: ['iPhone 15', 'Canon EOS 500D'],
    use: 'Products, places and people',
    summary: '*Light* and framing, for products, places and people.',
    since: 'Since TBD',
    works: [work('Products'), work('Places'), work('People')],
    kit: [
      { name: 'Canon EOS 500D', art: 'eos-500d' },
      { name: 'iPhone 15', art: 'iphone-15' },
    ],
    // a camera: body with its viewfinder hump, and the lens
    logo: [
      'M14 30 H33 L40 19 H60 L67 30 H86 A6 6 0 0 1 92 36 V78 A6 6 0 0 1 86 84 H14 A6 6 0 0 1 8 78 V36 A6 6 0 0 1 14 30 Z',
      'M68 57 A18 18 0 1 1 32 57 A18 18 0 1 1 68 57 Z',
      'M59 57 A9 9 0 1 1 41 57 A9 9 0 1 1 59 57 Z',
    ],
  },
];
