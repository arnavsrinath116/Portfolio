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
  /** renders or photos, shown one at a time with left and right buttons */
  images?: SkillImage[];
  /** a clickable Figma prototype, behind a poster of a few of its screens */
  prototype?: SkillPrototype;
  /** a film, self-hosted: nothing but its poster loads until Play */
  video?: { src: string; poster: string; width: number; height: number };
  /** the write-up that drops open under the work when it's picked; a placeholder shows until it's written */
  about?: string;
  /** not made yet: shown as a dashed "In drafting" sheet, without year or caption */
  pending?: boolean;
}

export interface SkillImage {
  /** in /public */
  src: string;
  alt: string;
  width: number;
  height: number;
  /**
   * what the image sits on: renders on black are 'dark' (the default), a sketch on white paper
   * 'light', or a colour (a page of toned paper, e.g. '#d8cfc0')
   */
  ground?: 'light' | 'dark' | `#${string}`;
  /** 'contain' shows the whole image on its ground (a square page in the wide frame); default 'cover' */
  fit?: 'cover' | 'contain';
}

export interface SkillPrototype {
  /** the Figma embed URL (embed.figma.com/proto/…), loaded only when Play is pressed */
  embed: string;
  /** the prototype in Figma, for opening full screen */
  link: string;
  /** a few screens for the poster, shown side by side as phones */
  screens: { src: string; alt: string }[];
  /** the screens' width:height, e.g. '402 / 874'; default 440 / 956 */
  aspect?: string;
  /** the screens' corner radius as a CSS border-radius, where the export has rounded corners baked in */
  corner?: string;
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
    name: '3D modeling & animation',
    tools: ['Fusion 360', 'Blender'],
    use: 'CAD parts, assemblies and renders',
    summary: 'Parametric CAD, from a first sketch to parts that *print and fit*.',
    since: 'Since TBD',
    // the first three are exported from the Fusion designs (visible bodies only), reduced and compressed for the web
    works: [
      {
        title: 'Turbojet engine',
        about:
          'I’ve always wanted to know what really happens inside a jet engine, so I built one, part by part. I modelled the fan, the compressor, the combustion chamber, the turbine and the nozzle, 38 parts in all, at real scale. Cutting it in half was the best part. You can see how the air comes in, gets squeezed, burns and shoots out the back.',
        kind: 'Assembly',
        year: 'Year TBD',
        caption: 'Modelled part by part, intake to exhaust; shown in section.',
        model: { src: '/models/jet.glb', size: [1330.8, 667.9, 667.7], parts: 38, section: true },
      },
      {
        title: 'Piston and connecting rod',
        about:
          'A small one, but I learned a lot from it. I modelled a piston, a connecting rod and the pin that joins them, and made them actually fit together. Getting the gaps right so the parts could move was harder than I expected. It taught me to think about how real parts connect, not just how they look.',
        kind: 'Assembly',
        year: 'Year TBD',
        caption: 'Piston, rod and gudgeon pin, modelled to fit together.',
        model: { src: '/models/piston.glb', size: [50, 105, 81.4], parts: 3 },
      },
      {
        title: 'BlackBox casing',
        about:
          'I designed this case to hold the electronics for a small device, and I 3D printed it. It’s six parts: a shell, a lid, a holder for the screen and mounts inside to keep everything in place. I kept changing the walls and the way the parts sit so they would print well and close neatly. Turn down the opacity to see what’s inside.',
        kind: 'Enclosure',
        year: 'Year TBD',
        caption: 'A printed enclosure with a display holder and mounts inside.',
        model: { src: '/models/blackbox.glb', size: [64, 64, 72], parts: 6, fade: ['Shell', 'Lid'] },
      },
      {
        title: 'Aston Martin lighting study',
        about:
          'Here I wanted to play with light, not the car itself. I lit the car so that a cool teal light runs over the bonnet and a warm orange light falls down the side, with the headlights glowing in a dark room. It showed me how much the mood of an image can change just by moving the lights.',
        kind: 'Render',
        year: 'Year TBD',
        caption: 'One car, lit for mood: a cool key on the bonnet, a warm wash down the flank.',
        images: [
          {
            src: '/skills/3d-modeling/aston-martin-01.webp',
            alt: 'A dark green Aston Martin in a black studio, headlights on, lit teal from the front and orange from the side',
            width: 2000,
            height: 1367,
          },
          {
            src: '/skills/3d-modeling/aston-martin-02.webp',
            alt: 'Close on the front of the green Aston Martin: a glowing round headlight, the grille, and the wheel lit orange from the side',
            width: 1920,
            height: 1080,
          },
        ],
      },
      {
        title: 'Traverse',
        about:
          'Traverse is a short film I worked on for Akela Studios. It jumps between LEGO stop-motion, hand-drawn animation and 3D, all in one story. The fun and the challenge was making each jump between styles feel like part of the journey instead of a cut.',
        kind: 'Animation',
        year: 'Year TBD',
        caption: 'A short film for Akela Studios: LEGO stop-motion, hand-drawn animation and 3D, cut together.',
        // re-encoded from 155 MB (1080p) to 720p H.264 at 1.5 Mbps with AAC audio, 21 MB
        video: { src: '/skills/3d-modeling/traverse-720.mp4', poster: '/skills/3d-modeling/traverse-poster.webp', width: 1280, height: 720 },
      },
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
    works: [
      {
        title: 'Nexo app',
        about:
          'Nexo is a smart device for dogs, and this is the app that goes with it. I designed the whole first-time experience: the welcome screens, turning on Bluetooth, finding and pairing the device, giving permissions, signing up and making a profile for your dog. I also planned what happens when pairing fails, so nobody gets stuck.',
        kind: 'Prototype',
        year: 'Year TBD',
        caption: 'The companion app for Nexo, a dog wearable: onboarding, pairing over Bluetooth, and the dashboard.',
        prototype: {
          embed:
            'https://embed.figma.com/proto/Cdj9gBe1hUUax8HRH9iHAa/Final-High-Fed-Nexo?node-id=38-59&starting-point-node-id=38%3A59&scaling=contain&content-scaling=fixed&hide-ui=1&embed-host=portfolio',
          link: 'https://www.figma.com/proto/Cdj9gBe1hUUax8HRH9iHAa/Final-High-Fed-Nexo?node-id=38-59&starting-point-node-id=38%3A59&scaling=scale-down',
          screens: [
            { src: '/skills/ui-design/nexo-welcome.webp', alt: 'Nexo welcome screen: “The bridge between you and your dog”, with a Get Started button' },
            { src: '/skills/ui-design/nexo-connect.webp', alt: 'Nexo pairing screen: “Lets Connect Your Nexo”, with a Find Devices button' },
            { src: '/skills/ui-design/nexo-connected.webp', alt: 'Nexo pairing done: “Congratulations, you are now connected to Nexo”' },
          ],
        },
      },
      {
        title: 'Cooked app',
        about:
          'Cooked lets you book a home chef. I designed both sides of the app. People can browse chefs and dishes, search by cuisine and order a past meal again. Chefs sign up in five simple steps, adding their best dishes, the recipes they cook and the cuisines they know. I kept it warm and friendly, with lots of food photos.',
        kind: 'Prototype',
        year: 'Year TBD',
        caption: 'Book a home chef: onboarding, browsing chefs and dishes, and a chef’s own sign-up.',
        prototype: {
          embed:
            'https://embed.figma.com/proto/CtrcTrgGn4vdgXafiUQdLL/UI-Kit-Food?node-id=563-4552&starting-point-node-id=563%3A4552&scaling=contain&content-scaling=fixed&hide-ui=1&embed-host=portfolio',
          link: 'https://www.figma.com/proto/CtrcTrgGn4vdgXafiUQdLL/UI-Kit-Food?node-id=563-4552&starting-point-node-id=563%3A4552&scaling=scale-down',
          aspect: '402 / 874',
          corner: '12.8% / 5.9%',
          screens: [
            { src: '/skills/ui-design/cooked-onboarding.webp', alt: 'Cooked onboarding: “Expert Chefs with 5 star reviews” over a chef plating a dish' },
            { src: '/skills/ui-design/cooked-home.webp', alt: 'Cooked home: a search bar, Find Chefs and Search Dishes, and recent meals to repeat' },
            { src: '/skills/ui-design/cooked-customise.webp', alt: 'Cooked customise dish: spice level from mild to extra hot, and the cooking oil' },
          ],
        },
      },
      work('Screens'),
      work('User flow'),
      work('Components'),
    ],
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
    slug: 'product-sketching',
    name: 'Product sketching',
    tools: ['Fineliner', 'Markers'],
    use: 'Concepts, form studies and marker renders',
    summary: 'Ideas put on paper *fast*, then given form.',
    since: 'Since TBD',
    works: [
      {
        title: 'Hand mixer',
        about:
          'Two quick ideas for a hand mixer. One is orange and white with an open, sharp handle. The other is a tall green shape you hold from the sides. I wanted to see how the handle, the motor and the whisk could work together, and how colour can give a simple kitchen tool some personality.',
        kind: 'Marker render',
        year: 'Year TBD',
        caption: 'Two takes on a hand mixer, rendered over bold marker swashes.',
        images: [
          {
            src: '/skills/product-sketching/hand-mixer-01.webp',
            alt: 'Two hand mixer concept sketches: an orange and white mixer with a whisk over a blue marker swash, and an upright green mixer over a purple one',
            width: 1920,
            height: 1080,
            ground: 'light',
          },
        ],
      },
      {
        title: 'Flight seat handle',
        about:
          'An idea for the handle on a plane seat. I drew it as one smooth loop, so it feels like a single shape that’s easy to find and hold. The grey body flows into a blue top, and I used the same colours in the background strokes.',
        kind: 'Marker render',
        year: 'Year TBD',
        caption: 'An aircraft seat handle as one looping stroke, in blue and grey.',
        images: [
          {
            src: '/skills/product-sketching/flight-seat-handle-01.webp',
            alt: 'A flight seat handle concept sketch: one looping grey grip with a blue top arm, over blue and grey marker swashes',
            width: 1920,
            height: 1080,
            ground: 'light',
          },
        ],
      },
      {
        title: 'Steering HMI',
        about:
          'I wanted to rethink the buttons on a steering wheel. First I ranked every control by how often you need it, from must-haves like indicators and the horn down to things like calls and heating. Then I sketched new ways to use them: a single press for indicators, a roller for volume, a wheel for the wipers and a dial for cruise control.',
        kind: 'Concept sheets',
        year: 'Year TBD',
        caption: 'Every control on the wheel, ranked by how often it is needed, then sketched as a gesture.',
        images: [
          {
            src: '/skills/product-sketching/steering-hmi-02-indicators.webp',
            alt: 'Steering wheel HMI sketch, sheet 2. Indicators: a stalk against a single press button, with push, left and right gestures sketched out; a control hierarchy list and a wheel diagram sit top left',
            width: 1400,
            height: 1400,
            ground: '#d8cfc0',
            fit: 'contain',
          },
          {
            src: '/skills/product-sketching/steering-hmi-03-media.webp',
            alt: 'Steering wheel HMI sketch, sheet 3. Media controls: a volume roller, a hidden track and play/pause strip, and a volume wheel on the rim; a control hierarchy list and a wheel diagram sit top left',
            width: 1400,
            height: 1400,
            ground: '#d8cfc0',
            fit: 'contain',
          },
          {
            src: '/skills/product-sketching/steering-hmi-04-wiper.webp',
            alt: 'Steering wheel HMI sketch, sheet 4. Wipers: a switch, a stalk and a wheel, with single-wipe and spray-and-wipe gestures; a control hierarchy list and a wheel diagram sit top left',
            width: 1400,
            height: 1400,
            ground: '#d8cfc0',
            fit: 'contain',
          },
          {
            src: '/skills/product-sketching/steering-hmi-05-cruise.webp',
            alt: 'Steering wheel HMI sketch, sheet 5. Cruise control: plus and minus speed, an activate rocker, and a knob with feedback detents; a control hierarchy list and a wheel diagram sit top left',
            width: 1400,
            height: 1400,
            ground: '#d8cfc0',
            fit: 'contain',
          },
        ],
      },
      work('Ideation'),
      work('Form study'),
      work('Exploded view'),
    ],
    // a sketch pad with a cylinder drawn on it
    logo: [
      'M20 12 H80 V92 H20 Z',
      'M66 40 A16 6 0 1 1 34 40 A16 6 0 1 1 66 40 Z',
      'M34 40 V70 A16 6 0 0 0 66 70 V40 A16 6 0 0 1 34 40 Z',
    ],
  },
  {
    slug: 'sketching',
    name: 'Sketching',
    tools: ['Pencil', 'Sketchbook'],
    use: 'Observation, perspective and everyday studies',
    summary: 'Drawing from life, to *see* how things are made.',
    since: 'Since TBD',
    works: [work('Observation'), work('Perspective'), work('Sketchbook')],
    // a pencil, tipped: eraser, body, sharpened tip and lead
    logo: [
      'M75.5 13.2 L86.8 24.5 L78.3 33 L67 21.7 Z',
      'M67 21.7 L78.3 33 L40.1 71.2 L28.8 59.9 Z',
      'M28.8 59.9 L40.1 71.2 L18.9 81.1 Z',
      'M23.1 71.9 L28.1 76.9 L18.9 81.1 Z',
    ],
  },
  {
    slug: 'photography',
    name: 'Photography',
    tools: ['iPhone 15', 'Canon EOS 500D'],
    use: 'Products, places and people',
    summary: '*Light* and framing, for products, places and people.',
    since: 'Since TBD',
    works: [
      {
        title: 'Debrecen Drive',
        about:
          'I shot these at a drift event in Debrecen. I moved the camera along with each car and used a slow shutter, so the car stays sharp and the background turns into streaks. In one photo I turned the background black and white to make the car’s colours pop.',
        kind: 'Motorsport',
        year: 'Year TBD',
        caption: 'Drift cars in Debrecen, panned slow so the car stays sharp and the world streaks.',
        images: [
          {
            src: '/skills/photography/debrecen-01-white-e36.webp',
            alt: 'A white BMW E36 drift car in livery, panned at speed so the track and trees blur behind it',
            width: 2000,
            height: 1320,
          },
          {
            src: '/skills/photography/debrecen-02-yellow-e36.webp',
            alt: 'A yellow BMW E36 coupe sliding sideways, rear tyre smoking, trees streaked green behind',
            width: 2000,
            height: 1138,
          },
          {
            src: '/skills/photography/debrecen-03-blue-s14.webp',
            alt: 'A blue and lime Nissan drift car panned sharp against a background turned black and white',
            width: 2000,
            height: 1098,
          },
        ],
      },
      work('Products'),
      work('Places'),
      work('People'),
    ],
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
