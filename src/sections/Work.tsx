import type { Theme } from "../context/ThemeContext";
import { useSectionInteraction } from "../context/SectionInteractionContext";
import SphereMenu from "../three/SphereMenu";
import ShaderBackground from "../components/ShaderBackground"
import { useEffect, useMemo, useRef } from "react";
import { motion, useInView } from "motion/react";

const toSvgDataUri = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
const WORK_SECTION_ID = "work";
const PROJECTS = ["Project 01", "Project 02", "Project 03", "Project 04"] as const;
const getProjectItemId = (projectName: string) => `work.${projectName.toLowerCase().replace(/\s+/g, "-")}`;

const items = [
  {
    id:"0",
    image: '/src/assets/zentlogo.png',
    background:'/src/assets/zentbg.png',
    link: 'https://zentrycopy.pages.dev/',
    title: 'Zentry Copy',
    subtitle: 'Premium Landing Page',
    date: '2025',
    description: 'Training on Gsap Animation and Cartoon Style'
  },
  {
    id:"1",
    image: '/src/assets/liryclogo.png',
    background: '/src/assets/simnav.png',
    link: 'https://eplab.ihu-liryc.fr/',
    title: 'EPLab',
    subtitle: 'Electrophysiology Visualization',
    date: '2025',
    description: 'Visualization of cardiac electrophysiology simulations for research and education'
  },
  {
    id:"2",
    image: '/src/assets/nessa-city.jpg',
    background: '/src/assets/artist.png',
    link: 'https://nathalieguy.fr/',
    title: 'Nathalie Guy',
    subtitle: 'Artistic Portfolio',
    date: '2026',
    description: 'Showcasing the artistic works and projects of Nathalie Guy'
  },
  {
    id:"3",
    image: '/src/assets/bdmmini.png',
    background: '/src/assets/boutdumonde.png',
    link: 'https://apps.hyblab.fr/story2020/bouts-du-monde/',
    title: 'Bouts du Monde',
    subtitle: 'Interactive Storytelling',
    date: '2020',
    description: 'Immersive web experience for the promotion of the magazine "Bouts du Monde"'
  }
];

const workOuterImageByTheme: Record<Theme, string> = {
  wireframe: toSvgDataUri(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'><rect width='1200' height='800' fill='#ecfdf5'/><g fill='#6ee7b7' opacity='0.55'><rect x='110' y='120' width='240' height='340' rx='18'/><rect x='390' y='180' width='220' height='280' rx='18'/><rect x='650' y='140' width='240' height='320' rx='18'/><rect x='930' y='210' width='160' height='250' rx='18'/></g></svg>`
  ),
  dark: toSvgDataUri(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'><rect width='1200' height='800' fill='#022c22'/><g fill='#065f46' opacity='0.65'><rect x='110' y='120' width='240' height='340' rx='18'/><rect x='390' y='180' width='220' height='280' rx='18'/><rect x='650' y='140' width='240' height='320' rx='18'/><rect x='930' y='210' width='160' height='250' rx='18'/></g></svg>`
  ),
  synthwave: toSvgDataUri(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='#0f766e'/><stop offset='100%' stop-color='#164e63'/></linearGradient></defs><rect width='1200' height='800' fill='url(#g)'/><g fill='#22d3ee' opacity='0.42'><rect x='110' y='120' width='240' height='340' rx='18'/><rect x='390' y='180' width='220' height='280' rx='18'/><rect x='650' y='140' width='240' height='320' rx='18'/><rect x='930' y='210' width='160' height='250' rx='18'/></g></svg>`
  ),
  brutalist: toSvgDataUri(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'><rect width='1200' height='800' fill='#f0f0ea'/><rect x='50' y='50' width='1100' height='700' fill='none' stroke='#111' stroke-width='16'/><rect x='112' y='120' width='240' height='340' fill='#111'/><rect x='390' y='180' width='220' height='280' fill='#111'/><rect x='650' y='140' width='240' height='320' fill='#111'/><rect x='930' y='210' width='160' height='250' fill='#111'/></svg>`
  ),
};

const workInnerThumbByTheme: Record<Theme, string> = {
  wireframe: toSvgDataUri(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 300'><rect width='500' height='300' fill='#f0fdf4'/><rect x='28' y='24' width='444' height='252' rx='16' fill='#bbf7d0'/><circle cx='120' cy='146' r='50' fill='#10b981'/><rect x='200' y='108' width='190' height='24' rx='12' fill='#047857'/><rect x='200' y='150' width='140' height='18' rx='9' fill='#065f46'/></svg>`
  ),
  dark: toSvgDataUri(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 300'><rect width='500' height='300' fill='#022c22'/><rect x='28' y='24' width='444' height='252' rx='16' fill='#064e3b'/><circle cx='120' cy='146' r='50' fill='#065f46'/><rect x='200' y='108' width='190' height='24' rx='12' fill='#bbf7d0'/><rect x='200' y='150' width='140' height='18' rx='9' fill='#6ee7b7'/></svg>`
  ),
  synthwave: toSvgDataUri(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 300'><rect width='500' height='300' fill='#083344'/><rect x='28' y='24' width='444' height='252' rx='16' fill='#155e75'/><circle cx='120' cy='146' r='50' fill='#06b6d4'/><rect x='200' y='108' width='190' height='24' rx='12' fill='#67e8f9'/><rect x='200' y='150' width='140' height='18' rx='9' fill='#22d3ee'/></svg>`
  ),
  brutalist: toSvgDataUri(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 300'><rect width='500' height='300' fill='#fffde8'/><rect x='20' y='20' width='460' height='260' fill='none' stroke='#111' stroke-width='8'/><rect x='42' y='44' width='160' height='212' fill='#111'/><rect x='230' y='86' width='220' height='26' fill='#111'/><rect x='230' y='140' width='160' height='20' fill='#111'/></svg>`
  ),
};

const WorkOuterContent = ({ theme }: { theme: Theme }) => {
  const { focusedItemId, activeItemId, setFocusedItemId } = useSectionInteraction(WORK_SECTION_ID);
  const container = useRef<HTMLDivElement>(null);
  const isInView = useInView(container);
  
  const progress = useMemo(() => {
    return (focusedItemId && isInView) ? 1.0 : 0.1;
  }, [focusedItemId, isInView]);

  return (
    <div className="work-theme z-10 theme-bg relative h-[150vh] lg:h-screen w-full flex justify-center items-center">
      <div className="absolute w-[55vh] h-[55vh] top-[25vh] lg:top-[35vh]">
        <div className="absolute inset-16 lg:inset-12 theme-border rounded-full"/>
      </div>
      <div className="absolute h-[100vw] w-[100vh] mt-[-45vh] lg:mt-[25vh] min-w-screen min-h-screen">
        <ShaderBackground image={items.find(item => item.id === activeItemId)?.background} progress={progress} />
        <div ref={container} className="absolute h-0 w-full top-1/2" />
      </div>
    </div>
  );
};

const WorkInnerContent = ({ theme }: { theme: Theme }) => {
  const {focusedItemId, setFocusedItemId} = useSectionInteraction(WORK_SECTION_ID);

  const closeItem = () => {
    setFocusedItemId(null);
  };

  return (
    <div className="relative work-theme flex h-[150vh] lg:h-screen w-full flex-col items-start pt-18">
      <p className="theme-sub ml-4 sm:ml-8 mb-2 text-xs uppercase tracking-widest">
        02 — Work
      </p>
      <div className="w-full h-0 theme-border" />
      <h2 className="theme-text theme-bg w-full ml-4 sm:ml-8 pt-4 text-4xl sm:text-5xl font-bold leading-none tracking-tight lg:text-7xl">
        Selected work
      </h2>
      <div className="absolute top-[30vh] lg:top-[35vh] h-[55vh] w-full flex flex-col lg:flex-row justify-between">
        <div className="theme-border grow min-h-[45vh] flex flex-col items-center">
          <SphereMenu size={window.innerWidth < 768 ? 0.5 : 0.6} items={items} className="absolute -mt-52 lg:-mt-50 h-screen w-screen cursor-grab"/>
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
