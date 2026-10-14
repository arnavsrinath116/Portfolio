import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { initFluid } from './ferrofluid';
import { initDust } from './dust';
import { playIntro } from './intro';
import { initHeroAnnotations } from './annotate';
import { initGuide } from './guide';
import { initDims } from './dims';
import { initProjectModal } from './projectModal';
import { initWire } from './wire';
import { initModelViewers } from './modelViewer';
import { initCookedCase } from './cookedCase';
import { initFooter } from './footer';
import { initMenu } from './menu';
import { initHeader } from './header';
import { initFrame } from './frame';
import { initClock } from './clock';

gsap.registerPlugin(ScrollTrigger);

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenis: Lenis | null = null;
if (!reduce) {
  lenis = new Lenis({ lerp: 0.11, anchors: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis!.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

initDust({ reduce });
const fluid = initFluid();

initFrame();
initHeader();
initClock();
initMenu({ fluid, lenis, reduce });

document.fonts.ready.then(() => {
  initHeroAnnotations({ reduce });
  initGuide({ reduce });
  initDims({ reduce });
  initWire({ reduce });
  initModelViewers({ reduce });
  initCookedCase({ reduce });
  initProjectModal({ lenis, reduce });
  initFooter({ reduce });
  playIntro();
  ScrollTrigger.refresh();
});
