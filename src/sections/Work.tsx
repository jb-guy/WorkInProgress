import type { Theme } from "../context/ThemeContext";
import { useSectionInteraction } from "../context/SectionInteractionContext";
import { preloadTextures } from "../three/ShaderBackground"
import { useEffect, useMemo, useRef, useState, lazy, Suspense } from "react";
import { AnimatePresence, motion, useInView, useMotionValueEvent, useScroll } from "motion/react";
import { useQueuedSceneUpdate } from "../hooks/useQueuedSceneUpdate";
import Carousel from "../components/Carousel";
import { SceneLoadingFallback } from "../components/SceneLoadingFallback";

const ShaderBackground = lazy(() => import("../three/ShaderBackground").then(module => ({ default: module.default })));

const toSvgDataUri = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
const WORK_SECTION_ID = "work";

const items = [
  {
    id:"0",
    image: '/zentlogo.png',
    background:'/zentbg.png',
    link: 'https://zentrycopy.pages.dev/',
    title: 'Zentry Copy',
    subtitle: 'Premium Landing Page',
    date: '2025',
    description: 'Training on Gsap Animation and Cartoon Style',
    front: ['React', 'GSAP', 'TailwindCSS']
  },
  {
    id:"1",
    image: '/liryclogo.png',
    background: '/simnav.png',
    link: 'https://eplab.ihu-liryc.fr/',
    title: 'EPLab',
    subtitle: 'Electrophysiology Visualization',
    date: '2025',
    description: 'Visualization of cardiac electrophysiology simulations for research and education',
    front: ['React', 'Vue', 'Vuetify', 'Three.js', 'WebGL'],
    back: ['Python', 'FastAPI', 'Websocket', 'Docker', 'Kafka']
  },
  {
    id:"2",
    image: '/nessa-city.jpg',
    background: '/artist.png',
    link: 'https://nathalieguy.fr/',
    title: 'Nathalie Guy',
    subtitle: 'Artistic Portfolio',
    date: '2026',
    description: 'Showcasing the artistic works and projects of Nathalie Guy',
    front: ['React', 'GSAP', 'TailwindCSS', 'emailJS'],
  },
  {
    id:"3",
    image: '/bdmmini.png',
    background: '/boutdumonde.png',
    link: 'https://apps.hyblab.fr/story2020/bouts-du-monde/',
    title: 'Bouts du Monde',
    subtitle: 'Interactive Storytelling',
    date: '2020',
    description: 'Immersive web experience for the promotion of the magazine "Bouts du Monde"',
    front: ['Javascript', 'JQuery', 'WebGL'],
  }
];

const WorkOuterContent = ({ theme, right }: { theme: Theme; right?: boolean }) => {
  const { details, setDetails, focusedItemId, activeItemId } = useSectionInteraction(WORK_SECTION_ID);
  const container = useRef<HTMLDivElement>(null);
  const isInView = useInView(container);

  // focusedItemId = press/hover preview; activeItemId = confirmed after drag release.
  const displayImage = useMemo(() => {
    return items.find(item => item.id === (activeItemId ?? focusedItemId))?.background;
  }, [activeItemId, focusedItemId]);

  useEffect(() => {
    if (!right ) {
      setDetails(isInView ? "inView" : "notInView");
    }
  }, [isInView]);

  const progress = useMemo(() => {
    if (activeItemId==focusedItemId && details === "inView") return window.innerWidth > 768 ? 0.75 : 1.0; 
    return 0.2;
  }, [activeItemId, focusedItemId, details]);

  return (
    <div className="work-theme theme-bg relative h-[120vh] lg:h-screen w-full flex justify-center items-center overflow-visible">
      <div className="absolute w-[55vh] h-[55vh] top-[25vh] lg:top-[35vh]">
        <div ref={container} className="absolute inset-16 lg:inset-12 theme-border rounded-full"/>
      </div>
      <div className="h-[100vw] w-[100vh] z-10 min-w-screen min-h-screen top-[-27.5vh] lg:top-[-20.5vh] overflow-visible">
        {theme === "cybernoir" && (
          <img src="/cyberworkbg.png" alt="cybernoir theme overlay" className="absolute size-full scale-120 -top-60 left-1 lg:-top-11 object-none object-[50%_44%] lg:object-[50%_60%] pointer-events-none" />
        )}
        <Suspense fallback={<SceneLoadingFallback height="h-full" />}>
          <ShaderBackground image={displayImage} progress={progress} className="-mt-15 lg:mt-25" />
        </Suspense>
      </div>
    </div>
  );
};

const WorkInnerContent = ({ theme, right }: { theme: Theme; right?: boolean }) => {
  const { focusedItemId, setFocusedItemId, activeItemId, setActiveItemId } = useSectionInteraction(WORK_SECTION_ID);
  const sectionRef = useRef<HTMLDivElement>(null);

  const queueSceneUpdate = useQueuedSceneUpdate();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["60% end", "80% end"],
  });

  // Preload all project backgrounds on mount so the shader never stalls on a cache miss.
  useEffect(() => {
    preloadTextures(items.map(i => i.background));
  }, []);

  useMotionValueEvent(scrollYProgress, "animationStart", () => {
    if (!right) return;
    queueSceneUpdate({ transition: 1 });
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (!right) return;
    queueSceneUpdate({
      themeLeft: "cybernoir",
      themeRight: "retro80",
      splitMode: "square",
      transition: (1-latest),
    });
  });
  //console.log(activeItemId, focusedItemId);

  return (
    <div ref={sectionRef} className="relative work-theme flex h-[120vh] lg:h-screen w-full flex-col items-start pt-18 pointer-events-auto">
      <p className="theme-sub ml-4 sm:ml-8 mb-2 text-xs uppercase tracking-widest">
        02 — Work
      </p>
      <div className="w-full h-0 theme-border" />
      <h2 className="theme-title w-full ml-4 sm:ml-8 pt-4 text-4xl sm:text-5xl font-bold leading-none tracking-tight lg:text-7xl">
        Selected work
      </h2>
      <div className="absolute top-[30vh] lg:top-[35vh] h-[55vh] w-full flex flex-col lg:flex-row justify-between">
          <div className="theme-border lg:grow min-h-[45vh] flex flex-col justify-center items-center">
            <p className="absolute -top-8.5 self-start lg:self-center theme-sub theme-bg opacity-0 wireframe:opacity-100 text-xs p-2 theme-border w-fit">Project Viewer</p>
            <div className="flex">
              <Carousel baseWidth={300} items={items} round loop />
            </div>
          </div>
      <AnimatePresence>
          {focusedItemId == activeItemId &&
          (<>
            <motion.div key="modal" initial={{ opacity: 0, x: -100 }} animate={{ opacity: 1, x: 0 }} exit={{opacity:0, x: -100}} className="z-200 lg:order-first theme-card relative lg:w-1/4 pointer-events-auto flex flex-col">
              <h3 className="text-3xl lg:pt-6">{items[Number(activeItemId)]?.title}</h3>
              <p className="theme-sub mt-6">{items[Number(activeItemId)]?.subtitle}</p>
              <p className="theme-sub opacity-50 text-sm">{items[Number(activeItemId)]?.date}</p>
              <p className="hidden lg:block mt-8 text-sm">{items[Number(activeItemId)]?.description}</p>
              <button onClick={() => window.open(items[Number(activeItemId)]?.link, "_blank")} className="self-end mt-8 px-4 py-2 border border-current theme-sub text-sm uppercase tracking-widest hover:bg-current/10 transition-colors">
                View project
              </button>
            </motion.div>
            <motion.div key="stack" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }} className="z-200 hidden lg:block theme-card w-1/4 pointer-events-auto text-right">
              <h3 className="text-3xl lg:pt-6">Stack used</h3>
              <div className="mt-8 flex flex-col gap-2">
                {items[Number(focusedItemId)]?.front && (
                  <div>
                    <p className="theme-sub text-sm">Front-end</p>
                    <ul className="mt-2 flex gap-x-2 flex-wrap justify-end">
                      {items[Number(activeItemId)]?.front.map((tech, index) => (
                          <li key={index} className="text-sm">{index !== 0 && <span>•</span>} {tech}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {items[Number(focusedItemId)]?.back && (
                  <div className="mt-4">
                    <p className="theme-sub text-sm">Back-end</p>
                    <ul className="mt-2 flex gap-x-2 flex-wrap justify-end">
                      {items[Number(focusedItemId)]?.back?.map((tech, index) => (
                          <li key={index} className="text-sm">{index !== 0 && <span>•</span>} {tech}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          </>)}
      </AnimatePresence>
      </div>
      <div className="w-full h-0 theme-border" />
    </div>
  );
};

type SectionThemeProps = {
  theme: Theme;
  right?: boolean;
};

const WorkOuter = ({ theme, right }: SectionThemeProps) => <WorkOuterContent theme={theme} right={right} />;

const WorkInner = ({ theme, right }: SectionThemeProps) => <WorkInnerContent theme={theme} right={right} />;

const Work = { Outer: WorkOuter, Inner: WorkInner };
export default Work;
