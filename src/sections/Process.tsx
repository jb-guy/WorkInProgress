import { use, useState, useRef } from "react";
import { useTheme, type Theme } from "../context/ThemeContext";
import { useMotionValueEvent, useScroll } from "motion/react";
import { useSectionInteraction } from "../context/SectionInteractionContext";

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


const ProcessOuterContent = ({ theme }: { theme: Theme }) => (
  <div className="process-theme theme-bg relative h-full w-full overflow-hidden">
  </div>
);

const ProcessInnerContent = ({ theme }: { theme: Theme }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { activeItemId, setActiveItemId } = useSectionInteraction("process");
  const step = activeItemId ? items.findIndex(item => item.id === activeItemId) : 0;

  return (
  <div ref={sectionRef} className="process-theme relative flex h-full w-full flex-col py-30">
    <p className="theme-sub mb-2 ml-4 font-mono text-xs uppercase tracking-widest">
      03 — Process
    </p>
    <div className="w-full h-0 theme-border"/>
    <h2 className="theme-text ml-4 sm:ml-8 pt-4 text-4xl sm:text-5xl font-bold leading-none tracking-tight lg:text-7xl">
      Development Process
    </h2>
    <div className="pt-10 w-8/10 self-center flex flex-row justify-around items-center">
      <button className="text-sub p-2" onClick={() => setActiveItemId("1")}> 01 </button>
      <span className="text-xs opacity-0 wireframe:opacity-50">&#8594;</span>
      <button className="text-sub p-2" onClick={() => setActiveItemId("2")}> 02 </button>
      <span className="text-xs opacity-0 wireframe:opacity-50">&#8594;</span>
      <button className="text-sub p-2" onClick={() => setActiveItemId("3")}> 03 </button>
      <span className="text-xs opacity-0 wireframe:opacity-50">&#8594;</span>
      <button className="text-sub p-2" onClick={() => setActiveItemId("4")}> 04 </button>
      <span className="text-xs opacity-0 wireframe:opacity-50">&#8594;</span>
      <button className="text-sub p-2" onClick={() => setActiveItemId("5")}> 05 </button>
      <span className="text-xs opacity-0 wireframe:opacity-50">&#8594;</span>
      <button className="text-sub p-2" onClick={() => setActiveItemId("6")}> 06 </button>
    </div>
    <div className="w-full h-0 theme-border"/>
    <div className="grow w-full flex flex-row">
      <div className="w-[35vw] flex flex-col justify-center text-left px-4">
        <h3 className="theme-title text-3xl font-bold leading-none tracking-tight lg:text-5xl">
          {items[step].title}
        </h3>
        <p className="theme-sub mt-6 max-w-xl text-sm">
          {items[step].keyPhrase}
        </p>
        <p className="theme-sub mt-2 max-w-xl text-sm">
          {items[step].description}
        </p>
      </div>
      <div className="grow h-full theme-spacer theme-card" />
    </div>
    <div className="w-full h-0 theme-border"/>
  </div>
)};

type SectionThemeProps = {
  theme: Theme;
};

const ProcessOuter = ({ theme }: SectionThemeProps) => <ProcessOuterContent theme={theme} />;

const ProcessInner = ({ theme }: SectionThemeProps) => <ProcessInnerContent theme={theme} />;

const Process = { Outer: ProcessOuter, Inner: ProcessInner };
export default Process;
