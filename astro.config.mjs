import { defineConfig } from 'astro/config';

export default defineConfig({
  // published with GitHub Pages from the repo "Portfolio": https://arnavsrinath116.github.io/Portfolio/
  site: 'https://arnavsrinath116.github.io',
  base: '/Portfolio',
  devToolbar: { enabled: false },
  vite: {
    // the 3D viewer imports these lazily; bundle them up front so the dev server
    // never finds them "outdated" mid-session
    optimizeDeps: {
      include: [
        'three',
        'three/examples/jsm/loaders/GLTFLoader.js',
        'three/examples/jsm/loaders/DRACOLoader.js',
        'three/examples/jsm/controls/OrbitControls.js',
      ],
    },
  },
});
