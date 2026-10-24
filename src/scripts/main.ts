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
import { initTrackerCase } from './trackerCase';
import { initSkillDims } from './skillDims';
import { initHighlights } from './highlights';
import { initHeroJet } from './heroJet';
import { initFooter } from './footer';
import { initNav } from './nav';
import { initHeader } from './header';
import { initFrame } from './frame';
import { initClock } from './clock';
import { initWordReveal } from './wordReveal';
import { initAbout } from './about';
import { initMusicRoom } from './musicRoom';
import { lite } from './perf';

gsap.registerPlugin(ScrollTrigger);

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenis: Lenis | null = null;
// lite mode (weaker devices): native scrolling, no dust, no mercury cursor
if (!reduce && !lite) {
  // a heavier glide: each wheel tick travels a little less and settles a little longer
  lenis = new Lenis({ lerp: 0.08, wheelMultiplier: 0.85, anchors: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis!.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

if (!lite) {
  initDust({ reduce });
  initFluid(); // the mercury cursor
}

initFrame();
initHeader();
initClock();
initNav({ lenis });
// armed before first paint settles, so the blocks never flash full and then empty
initHighlights({ reduce });

document.fonts.ready.then(() => {
  initAbout({ reduce });
  initMusicRoom({ reduce }); // loads three.js and the physics only when the Music tab opens
  initHeroAnnotations({ reduce });
  initHeroJet({ reduce });
  initGuide({ reduce });
  initDims({ reduce });
  initWordReveal({ reduce }); // after the dimensions measure the lettering
  initWire({ reduce });
  initModelViewers({ reduce });
  initCookedCase({ reduce });
  initTrackerCase({ reduce });
  initSkillDims({ reduce });
  initProjectModal({ lenis, reduce });
  initFooter({ reduce });
  playIntro();
  ScrollTrigger.refresh();
});
