import { use, useEffect, useRef } from "react";
import { useTheme, type Theme } from "../context/ThemeContext";
import { useMotionValueEvent, useScroll } from "motion/react";

const toSvgDataUri = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const aboutOuterImageByTheme: Record<Theme, string> = {
  wireframe: toSvgDataUri(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'><rect width='1200' height='800' fill='#f8fafc'/><g fill='#cbd5e1'><rect x='90' y='130' width='300' height='180' rx='18'/><rect x='430' y='230' width='360' height='220' rx='18'/><rect x='820' y='130' width='280' height='160' rx='18'/></g></svg>`
  ),
  dark: toSvgDataUri(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'><rect width='1200' height='800' fill='#1e1b4b'/><g fill='#312e81'><rect x='90' y='130' width='300' height='180' rx='18'/><rect x='430' y='230' width='360' height='220' rx='18'/><rect x='820' y='130' width='280' height='160' rx='18'/></g></svg>`
  ),
  synthwave: toSvgDataUri(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='#312e81'/><stop offset='100%' stop-color='#831843'/></linearGradient></defs><rect width='1200' height='800' fill='url(#g)'/><g fill='#db2777' opacity='0.55'><rect x='90' y='130' width='300' height='180' rx='18'/><rect x='430' y='230' width='360' height='220' rx='18'/><rect x='820' y='130' width='280' height='160' rx='18'/></g></svg>`
  ),
  brutalist: toSvgDataUri(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'><rect width='1200' height='800' fill='#efe8d8'/><rect x='40' y='40' width='1120' height='720' fill='none' stroke='#111' stroke-width='16'/><rect x='120' y='160' width='260' height='220' fill='#111'/><rect x='460' y='220' width='300' height='270' fill='#111'/><rect x='820' y='140' width='250' height='210' fill='#111'/></svg>`
  ),
};

const aboutInnerImageByTheme: Record<Theme, string> = {
  wireframe: toSvgDataUri(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 380'><rect width='640' height='380' fill='#f1f5f9'/><rect x='24' y='24' width='592' height='332' rx='16' fill='#e2e8f0'/><rect x='68' y='90' width='220' height='18' rx='9' fill='#64748b'/><rect x='68' y='126' width='170' height='14' rx='7' fill='#94a3b8'/><circle cx='470' cy='190' r='84' fill='#94a3b8'/></svg>`
  ),
  dark: toSvgDataUri(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 380'><rect width='640' height='380' fill='#0f172a'/><rect x='24' y='24' width='592' height='332' rx='16' fill='#1e293b'/><rect x='68' y='90' width='220' height='18' rx='9' fill='#cbd5e1'/><rect x='68' y='126' width='170' height='14' rx='7' fill='#94a3b8'/><circle cx='470' cy='190' r='84' fill='#334155'/></svg>`
  ),
  synthwave: toSvgDataUri(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 380'><rect width='640' height='380' fill='#1e1b4b'/><rect x='24' y='24' width='592' height='332' rx='16' fill='#312e81'/><rect x='68' y='90' width='220' height='18' rx='9' fill='#f472b6'/><rect x='68' y='126' width='170' height='14' rx='7' fill='#a78bfa'/><circle cx='470' cy='190' r='84' fill='#db2777'/></svg>`
  ),
  brutalist: toSvgDataUri(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 380'><rect width='640' height='380' fill='#f7f7f7'/><rect x='22' y='22' width='596' height='336' fill='none' stroke='#111' stroke-width='10'/><rect x='52' y='80' width='220' height='28' fill='#111'/><rect x='52' y='128' width='170' height='20' fill='#111'/><rect x='332' y='110' width='236' height='178' fill='#111'/></svg>`
  ),
};

const AboutOuterContent = ({ theme }: { theme: Theme }) => (
  <div className="about-theme theme-bg relative h-full w-full overflow-hidden">
  </div>
);

const AboutInnerContent = ({ theme }: { theme: Theme }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { setThemeRight, setSplitY, setSplitMode } = useTheme();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["30% center", "40% center"],
  });
  
  useMotionValueEvent(scrollYProgress, "animationStart", () => {
    //Not working
    console.log("Service section scroll animation started");
    setSplitY(window.innerHeight);
  });
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    //setThemeRight("synthwave");
    //setSplitMode("horizontal");
    setSplitY((1 - latest) * window.innerHeight);
  });

  return (
  <div ref={sectionRef} className="about-theme relative flex h-full w-full flex-col py-30">
    <p className="theme-sub mb-2 ml-4 font-mono text-xs uppercase tracking-widest">
      01 — About
    </p>
    <div className="w-full h-0 border"/>
    <div className="grow w-full flex flex-row">
      <div className="min-w-[15vw] w-[20vw] h-full theme-spacer" />
      <div className="grow flex flex-col items-center justify-center text-center px-4">
        <h2 className="theme-text text-4xl  font-bold leading-none tracking-tight lg:text-7xl">
          My philosophy
        </h2>
        <p className="theme-sub mt-6 max-w-xl text-center text-sm">
          I build interfaces that evolve through interaction.
        </p>
        <p className="theme-text mt-6 max-w-xl text-center text-sm">
          My work focuses on immersive web experiences,
          interactive storytelling and reactive digital systems.

          I’m particularly interested in the space between
          interface design, motion and realtime rendering.
        </p>
      </div>
      <div className="min-w-[15vw] w-[20vw] h-full theme-spacer" />
    </div>
    <div className="w-full h-0 border"/>
  </div>
)};

type SectionThemeProps = {
  theme: Theme;
};

const AboutOuter = ({ theme }: SectionThemeProps) => <AboutOuterContent theme={theme} />;

const AboutInner = ({ theme }: SectionThemeProps) => <AboutInnerContent theme={theme} />;

const About = { Outer: AboutOuter, Inner: AboutInner };
export default About;
