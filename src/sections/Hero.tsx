import { animate, useInView } from "motion/react";
import type { Theme } from "../context/ThemeContext";
import { useSplitTransition, useTheme } from "../context/ThemeContext";
import HeroThemeScene from "../three/HeroThemeScene";
import { useEffect, useRef } from "react";


const HeroOuterContent = ({ theme, right }: { theme: Theme, right?: boolean }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef);
  return (
  <div className="hero-theme theme-bg relative h-screen w-full overflow-hidden" ref={containerRef}>
    <div
      className="h-full w-full"
    >
      <HeroThemeScene theme={theme} play={inView}/>
    </div>
  </div>
)};

const HeroInnerContent = ({ right, theme }: { right?: boolean; theme: Theme }) => {
  const { setThemeRight, setThemeLeft } = useTheme();
  const { setTransition, setSplitMode } = useSplitTransition();

  const handleCta = () => {
    
  };

  useEffect(() => {
    if(right) return;
    setSplitMode("circle");
    setThemeRight("holographic");
    animate(0,1, {
      delay: 1.5,
      duration: 0.8,
      onUpdate(value) {
        setTransition(value);
      },
      onComplete() {
        setThemeLeft("holographic");
      }
    });
  }, []);
      

  return (
  <div className="hero-theme relative h-screen w-full flex flex-col justify-end pb-2 lg:pb-10">
    <p className="mb-2 ml-4 text-xs uppercase tracking-widest theme-sub">
      00 — Hero
    </p>
    <div className="flex flex-col lg:flex-row wireframe:border-t wireframe:border-b">
      <div className="grow wireframe:lg:border-r lg:px-8 py-8">
        <h1 className="text-8xl text-center lg:text-left font-bold lg:text-[12rem] theme-title hero-title">
          <span>JB</span>Guy
        </h1>
      </div>
      <div className="flex flex-col items-end justify-end">
        <div className="w-full grow theme-spacer" />
        <div className="m-4 flex flex-col items-start">
          <p className="text-md lg:text-2xl theme-text">
            Creative Fullstack Developer.
          </p>
          <p className="text-xs lg:text-sm theme-text">
            Building innovative interfaces,
            interactive narratives
            and immersive web experiences.
          </p>
          <button
            onClick={handleCta}
            className="mt-6 px-6 py-2 theme-body self-end text-sm tracking-widest"
          >
            View Work
          </button>

        </div>
      </div>
    </div>
  </div>
  );
};

type SectionThemeProps = {
  theme: Theme;
};

const HeroInner = ({ theme, right }: SectionThemeProps & { right?: boolean }) => <HeroInnerContent theme={theme} right={right} />;

const HeroOuter = ({ theme, right }: SectionThemeProps & { right?: boolean }) => <HeroOuterContent theme={theme} right={right} />;

const Hero = { Outer: HeroOuter, Inner: HeroInner };
export default Hero;