import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { initFluid } from './ferrofluid';
import { playIntro } from './intro';
import { initHeroAnnotations } from './annotate';
import { initSlabs } from './slabs';
import { initGuide } from './guide';
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

const fluid = initFluid();

initFrame();
initHeader();
initClock();
initMenu({ fluid, lenis, reduce });

document.fonts.ready.then(() => {
  initHeroAnnotations({ reduce });
  initSlabs({ reduce });
  initGuide({ reduce });
  initFooter({ reduce });
  playIntro();
  ScrollTrigger.refresh();
});
