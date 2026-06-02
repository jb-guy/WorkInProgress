import type { Theme } from "../context/ThemeContext";
import { useSectionInteraction } from "../context/SectionInteractionContext";
import SphereMenu from "../three/SphereMenu";
import ShaderBackground from "../three/ShaderBackground"
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useMotionValueEvent, useScroll } from "motion/react";
import { useQueuedSceneUpdate } from "../hooks/useQueuedSceneUpdate";

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
    description: 'Training on Gsap Animation and Cartoon Style'
  },
  {
    id:"1",
    image: '/liryclogo.png',
    background: '/simnav.png',
    link: 'https://eplab.ihu-liryc.fr/',
    title: 'EPLab',
    subtitle: 'Electrophysiology Visualization',
    date: '2025',
    description: 'Visualization of cardiac electrophysiology simulations for research and education'
  },
  {
    id:"2",
    image: '/nessa-city.jpg',
    background: '/artist.png',
    link: 'https://nathalieguy.fr/',
    title: 'Nathalie Guy',
    subtitle: 'Artistic Portfolio',
    date: '2026',
    description: 'Showcasing the artistic works and projects of Nathalie Guy'
  },
  {
    id:"3",
    image: '/bdmmini.png',
    background: '/boutdumonde.png',
    link: 'https://apps.hyblab.fr/story2020/bouts-du-monde/',
    title: 'Bouts du Monde',
    subtitle: 'Interactive Storytelling',
    date: '2020',
    description: 'Immersive web experience for the promotion of the magazine "Bouts du Monde"'
  }
];

const WorkOuterContent = ({ theme, right }: { theme: Theme; right?: boolean }) => {
  const { hoveredItemId, focusedItemId, activeItemId } = useSectionInteraction(WORK_SECTION_ID);
  const container = useRef<HTMLDivElement>(null);
  const isInView = useInView(container);
  
  const progress = useMemo(() => {
    return (focusedItemId && isInView) ? 0.6 : 0.1;
  }, [focusedItemId, isInView]);

  return (
    <div className="work-theme theme-bg relative h-[120vh] lg:h-screen w-full flex justify-center items-center">
      <div className="absolute w-[55vh] h-[55vh] top-[25vh] lg:top-[35vh]">
        <div ref={container} className="absolute inset-16 lg:inset-12 theme-border rounded-full"/>
      </div>
      <div className="absolute h-[100vw] w-[100vh] mt-[-15vh] lg:mt-[25vh] min-w-screen min-h-screen">
        {theme === "cybernoir" && (
          <img src="/cyberworkbg.png" alt="cybernoir theme overlay" className="absolute inset-0 scale-200 lg:scale-150 lg:top-10 object-cover pointer-events-none" />
        )}
        <ShaderBackground image={items.find(item => item.id === activeItemId)?.background} progress={progress} />
      </div>
    </div>
  );
};

const WorkInnerContent = ({ theme, right }: { theme: Theme; right?: boolean }) => {
  const {focusedItemId, setFocusedItemId, setHoveredItemId} = useSectionInteraction(WORK_SECTION_ID);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [showHint, setShowHint] = useState<boolean>(true);

  const queueSceneUpdate = useQueuedSceneUpdate();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["60% end", "90% end"],
  });

  useEffect(() => {
    if (focusedItemId) {
      setShowHint(false);
    }
  }, [focusedItemId]);

  useMotionValueEvent(scrollYProgress, "animationStart", () => {
    if (!right) return;
    queueSceneUpdate({ transition: 1 });
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    console.log("Work section scroll progress:", right);
    if (!right) return;
    queueSceneUpdate({
      themeLeft: "retro80",
      themeRight: "cybernoir",
      splitMode: "square",
      transition: latest,
    });
  });

  const closeItem = () => {
    setFocusedItemId(null);
  };

  return (
    <div ref={sectionRef} className="relative work-theme flex h-[120vh] lg:h-screen w-full flex-col items-start pt-18">
      <p className="theme-sub ml-4 sm:ml-8 mb-2 text-xs uppercase tracking-widest">
        02 — Work
      </p>
      <div className="w-full h-0 theme-border" />
      <h2 className="theme-title w-full ml-4 sm:ml-8 pt-4 text-4xl sm:text-5xl font-bold leading-none tracking-tight lg:text-7xl">
        Selected work
      </h2>
      <AnimatePresence>
        {showHint && (
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5], y: 0, transition: { duration: 1, ease: "easeInOut", repeat: showHint ? Infinity : 0 } }}
            exit={{ opacity: 0, y: 20 }}
            className="theme-sub inset-0 mx-auto mt-20 text-3xl"
          >
            Grab the project sphere and explore
          </motion.p>
        )}
      </AnimatePresence>
      <div className="absolute top-[30vh] lg:top-[35vh] h-[55vh] w-full flex flex-col lg:flex-row justify-between">
        <div className="theme-border grow min-h-[45vh] flex flex-col items-center">
          <div 
            className="absolute -mt-52 lg:-mt-50 h-screen w-screen">
            <SphereMenu size={window.innerWidth < 768 ? 0.5 : 0.6} items={items}/>
          </div>
          <div className="z-200 absolute w-screen h-[22.5vh] top-[-22.5vh] " />
          <div className="z-200 absolute w-screen h-[22.5vh] bottom-[-22.5vh] " />
          <p className="relative -top-8.5 self-start lg:self-center theme-sub theme-bg opacity-0 wireframe:opacity-100 text-xs p-2 theme-border w-fit">Project Viewer</p>
          <motion.button 
            transition={{delay: focusedItemId ? 0.5 : 0, duration: 0.5, ease: "backInOut"}} 
            animate={{scale: focusedItemId ? 1 : 0}} 
            onClick={closeItem}
            className="z-220 hidden relative top-12 left-16 h-10 w-10 bg-white border rounded-full"
            >
            <div className="absolute inset-x-1 inset-y-4.5 border rotate-45 origin-center"/>
            <div className="absolute inset-x-1 inset-y-4.5 border -rotate-45 origin-center"/>
          </motion.button>
        </div>
        <AnimatePresence>
          {focusedItemId &&
          (<>
          <motion.div initial={{ opacity: 0, x: -100 }} animate={{ opacity: 1, x: 0 }} className="z-200 md:order-first theme-card relative lg:w-1/4 pointer-events-auto flex flex-col">
            <h3 className="text-3xl">{items[Number(focusedItemId)]?.title}</h3>
            <p className="theme-sub mt-6">{items[Number(focusedItemId)]?.subtitle}</p>
            <p className="theme-sub opacity-50 text-sm">{items[Number(focusedItemId)]?.date}</p>
            <p className="hidden lg:block mt-8 text-sm">{items[Number(focusedItemId)]?.description}</p>
            <button onClick={() => window.open(items[Number(focusedItemId)]?.link, "_blank")} className="self-end mt-8 px-4 py-2 border border-current theme-sub text-sm uppercase tracking-widest hover:bg-current/10 transition-colors">
              View project
            </button>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} className="z-200 hidden lg:block theme-card w-1/4 pointer-events-auto text-right">
            <h3 className="text-3xl">Stack used</h3>
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
