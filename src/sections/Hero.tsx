import { animate } from "motion/react";
import type { Theme } from "../context/ThemeContext";
import { useTheme } from "../context/ThemeContext";
import HeroThemeScene from "../three/HeroThemeScene";


const HeroOuterContent = ({ theme }: { theme: Theme }) => (
  <div className="hero-theme theme-bg relative h-screen w-full overflow-hidden">
    <div
      className="h-full w-full"
    >
      <HeroThemeScene theme={theme} />
    </div>
  </div>
);

const HeroInnerContent = () => {
  const { setThemeRight, setSplitX, setSplitMode } = useTheme();

  const handleCta = () => {
    const vw = window.innerWidth;
    // 1. Set split to far right immediately
    setSplitMode("vertical");
    setSplitX(vw);
    //setThemeRight("synthwave");

    // 2. Animate split from far right to far left in 0.5s with ease
    animate(vw, 0, {
      duration: 0.5,
      ease: [0.099, 2.038, 0.677, -0.964],
      onUpdate: (latest) => setSplitX(latest),
    });
  };

  return (
  <div className="hero-theme relative h-screen w-full flex flex-col justify-end pb-2 lg:pb-10">
    <p className="mb-2 ml-4 text-xs uppercase tracking-widest theme-sub">
      00 — Hero
    </p>
    <div className="flex flex-col lg:flex-row border-t border-b border-current">
      <div className="grow lg:border-r border-current lg:px-8 py-8">
        <h1 className="text-8xl text-center lg:text-left font-bold lg:text-[12rem] hero-title">
          <span>JB</span>Guy
        </h1>
      </div>
      <div className="flex flex-col items-end justify-end">
        <div className="w-full grow theme-spacer" />
        <div className="m-4 flex flex-col items-start">
          <p className="text-md lg:text-2xl hero-body">
            Creative Fullstack Developer.
          </p>
          <p className="text-xs lg:text-sm hero-body-theme">
            Building innovative interfaces,
            interactive narratives
            and immersive web experiences.
          </p>
          <button
            onClick={handleCta}
            className="mt-6 px-6 py-2 hero-body-theme self-end text-sm tracking-widest"
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

const HeroInner = () => <HeroInnerContent />;

const HeroOuter = ({ theme }: SectionThemeProps) => <HeroOuterContent theme={theme} />;

const Hero = { Outer: HeroOuter, Inner: HeroInner };
export default Hero;