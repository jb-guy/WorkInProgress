import type { Theme } from "../context/ThemeContext";
import { useSectionInteraction } from "../context/SectionInteractionContext";
import SphereMenu from "../three/SphereMenu";
import ShaderBackground from "../three/ShaderBackground"
import { useEffect, useMemo, useRef } from "react";
import { motion, useInView } from "motion/react";

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

const WorkOuterContent = ({ theme }: { theme: Theme }) => {
  const { hoveredItemId, focusedItemId, activeItemId } = useSectionInteraction(WORK_SECTION_ID);
  const container = useRef<HTMLDivElement>(null);
  const isInView = useInView(container);
  
  const progress = useMemo(() => {
    return (focusedItemId && isInView) ? 1.0 : 0.1;
  }, [focusedItemId, isInView]);

  return (
    <div className="work-theme z-10 theme-bg relative h-[120vh] lg:h-screen w-full flex justify-center items-center">
      <div className="absolute w-[55vh] h-[55vh] top-[25vh] lg:top-[35vh]">
        <div className="absolute inset-16 lg:inset-12 theme-border rounded-full"/>
      </div>
      <div className="absolute h-[100vw] w-[100vh] mt-[-15vh] lg:mt-[25vh] min-w-screen min-h-screen">
        <ShaderBackground image={items.find(item => item.id === activeItemId)?.background} progress={progress} />
        <div ref={container} className="absolute h-0 w-full top-1/2" />
      </div>
    </div>
  );
};

const WorkInnerContent = ({ theme }: { theme: Theme }) => {
  const {hoveredItemId, focusedItemId, setFocusedItemId, setHoveredItemId} = useSectionInteraction(WORK_SECTION_ID);

  const closeItem = () => {
    setFocusedItemId(null);
  };

  return (
    <div className="relative work-theme flex h-[120vh] lg:h-screen w-full flex-col items-start pt-18">
      <p className="theme-sub ml-4 sm:ml-8 mb-2 text-xs uppercase tracking-widest">
        02 — Work
      </p>
      <div className="w-full h-0 theme-border" />
      <h2 className="theme-title theme-bg w-full ml-4 sm:ml-8 pt-4 text-4xl sm:text-5xl font-bold leading-none tracking-tight lg:text-7xl">
        Selected work
      </h2>
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
        <div className=" z-200 md:order-first theme-card relative lg:w-1/4 pointer-events-auto flex flex-col">
          <h3 className="theme-text text-3xl font-bold">{items[Number(focusedItemId)]?.title}</h3>
          <p className="theme-sub mt-6">{items[Number(focusedItemId)]?.subtitle}</p>
          <p className="theme-sub opacity-50 mt-1 text-sm">{items[Number(focusedItemId)]?.date}</p>
          <p className="theme-sub hidden lg:block mt-8 text-sm">{items[Number(focusedItemId)]?.description}</p>
          <button onClick={() => window.open(items[Number(focusedItemId)]?.link, "_blank")} className="self-end mt-8 px-4 py-2 border border-current theme-sub text-sm uppercase tracking-widest hover:bg-current/10 transition-colors">
            View project
          </button>
        </div>
        <div className="z-200 hidden lg:block theme-card w-1/4 pointer-events-auto text-right">
          <h3 className="theme-text text-3xl font-bold">Stack used</h3>
        </div>
      </div>
      <div className="w-full h-0 theme-border" />
    </div>
  );
};

type SectionThemeProps = {
  theme: Theme;
};

const WorkOuter = ({ theme }: SectionThemeProps) => <WorkOuterContent theme={theme} />;

const WorkInner = ({ theme }: SectionThemeProps) => <WorkInnerContent theme={theme} />;

const Work = { Outer: WorkOuter, Inner: WorkInner };
export default Work;
