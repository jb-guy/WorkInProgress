import { use, useState, useRef, useMemo, memo } from "react";
import { useTheme, type Theme } from "../context/ThemeContext";
import { useMotionValueEvent, useScroll } from "motion/react";
import { useSectionInteraction } from "../context/SectionInteractionContext";
import KoiCatScene from "../three/KoiCatScene";
import { useQueuedSceneUpdate } from "../hooks/useQueuedSceneUpdate";

const items = [
  {
    id: "1",
    title: "Concept",
    keyPhrase: "Every experience starts with an idea.",
    description: "Exploration of emotion, atmosphere and experience direction before any production constraints.",
    keyWords: ["Ideation", "Moodboarding", "Experience Design", "Storytelling"],
  },
  {
    id: "2",
    title: "Narrative",
    keyPhrase: "Interfaces become meaningful through progression.",
    description: "Crafting the user journey and interaction flow to create engaging and intuitive experiences.",
    keyWords: ["User Journey", "Interaction Flow", "Engagement", "Intuitiveness"],
  },
  {
    id: "3",
    title: "Architecture",
    keyPhrase: "A solid structure supports immersive experiences.",
    description: "Designing the underlying structure and systems that enable seamless and responsive interactions.",
    keyWords: ["System Design", "Technical Structure", "Seamlessness", "Responsiveness"],
  },
  {
    id: "4",
    title: "Visual Systems",
    keyPhrase: "Visual coherence enhances immersion.",
    description: "Creating cohesive visual languages and aesthetics that enhance the overall experience and reinforce the narrative.",
    keyWords: ["Visual Language", "Aesthetics", "Cohesion", "Reinforcement"],
  },
  {
    id: "5",
    title: "Motion & Interaction",
    keyPhrase: "Movement brings interfaces to life.",
    description: "Designing animations and interactions that guide users and enhance the overall experience.",
    keyWords: ["Animation", "Interaction Design", "User Guidance", "Experience Enhancement"],
  },
  {
    id: "6",
    title: "Production",
    keyPhrase: "Bringing ideas to reality.",
    description: "Executing the final production phase to deliver polished and functional experiences.",
    keyWords: ["Execution", "Polish", "Functionality", "Delivery"],
  },
];


const ProcessOuterContent = ({ theme }: { theme: Theme }) => {
  const {activeItemId} = useSectionInteraction("process");
  const step = useMemo(() => {
    if (!activeItemId) return 0;
    const index = items.findIndex(item => item.id === activeItemId);
    return index !== -1 ? index : 0;
  }, [activeItemId]);

  return (
  <div className="process-theme theme-bg relative h-screen w-full overflow-hidden">
    {theme == "dreamscape" && <img src="/processpotion.png" alt="Process Background" className="absolute inset-0 w-full h-full scale-110 object-cover"/>}
    <div className="absolute inset-0 lg:translate-x-2/10 lg:translate-y-1/10">
      {theme == "dreamscape" && <KoiCatScene step={step}/>}
    </div>
  </div>
)};

const ProcessInnerContent = ({ theme, right }: { theme: Theme, right?: boolean }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { activeItemId, setActiveItemId } = useSectionInteraction("process");
  const step = useMemo(() => {
    if (!activeItemId) return 0;
    const index = items.findIndex(item => item.id === activeItemId);
    return index !== -1 ? index : 0;
  }, [activeItemId]);

    const queueSceneUpdate = useQueuedSceneUpdate();
    const { scrollYProgress } = useScroll({
      target: sectionRef,
      offset: ["60% end", "80% end"],
    });
  
    useMotionValueEvent(scrollYProgress, "animationStart", () => {
      if (right) return;
      queueSceneUpdate({ transition: 1 });
    });
  
    useMotionValueEvent(scrollYProgress, "change", (latest) => {
      if (right) return;
      queueSceneUpdate({
        themeLeft: "cybernoir",
        themeRight: "dreamscape",
        splitMode: "vertical",
        transition: latest,
      });
    });

  return (
  <div ref={sectionRef} className="process-theme relative flex h-screen w-full flex-col py-15 lg:py-30">
    <p className="theme-sub mb-2 lg:ml-4 font-mono text-xs uppercase tracking-widest">
      03 — Process
    </p>
    <div className="w-full h-0 theme-border border-b-0!"/>
    <h2 className="theme-title pt-4 mb-6 lg:ml-10 text-4xl sm:text-5xl font-bold leading-none tracking-tight lg:text-5xl">
      Development Process
    </h2>

    <div className="lg:h-16 lg:gap-4 p-2 lg:ml-4 mb-6 flex justify-around lg:justify-start ">
      {items.map((item) => (
        <button
          key={item.id}
          className="size-12 lg:size-auto text-sub rounded-full! lg:rounded-xl! text-xs max-w-32"
          onClick={() => setActiveItemId(item.id)}
        >
          {window.innerWidth >= 1024 ? item.title : `0${item.id}`}
        </button>
      ))}
    </div>
    
    <div className="h-full w-full">
      <div className="h-full w-full flex flex-col lg:flex-row">
        <div className=" h-80 lg:h-full lg:grow theme-spacer"/>
        <div className="lg:order-first lg:w-7/20 theme-card flex flex-col justify-center text-left">
          <h3 className="theme-title mx-5 text-3xl font-bold leading-none tracking-tight lg:text-5xl">
            {items[step].title}
          </h3>
          <p className="theme-sub mx-5 mt-4 max-w-xl text-sm">
            {items[step].keyPhrase}
          </p>
          <p className="theme-text mx-5 mt-10 max-w-xl text-sm">
            {items[step].description}
          </p>
        </div>
      </div>
    </div>
  </div>
)};

type SectionThemeProps = {
  theme: Theme;
};

const ProcessOuter = ({ theme }: SectionThemeProps) => <ProcessOuterContent theme={theme} />;

const ProcessInner = ({ theme }: SectionThemeProps) => <ProcessInnerContent theme={theme} />;

const Process = { Outer: ProcessOuter, Inner: ProcessInner };
export default Process;

