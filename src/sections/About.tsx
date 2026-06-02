import { useEffect, useRef } from "react";
import { useTheme, type Theme } from "../context/ThemeContext";
import { useMotionValueEvent, useScroll } from "motion/react";
import { useQueuedSceneUpdate } from "../hooks/useQueuedSceneUpdate";
import CinematicNoiseOverlay from "../components/CinematicNoiseOverlay";

const AboutOuterContent = ({ theme, right }: { theme: Theme; right?: boolean }) => (
  <div className="about-theme theme-bg relative h-screen w-full overflow-hidden">
  </div>
);

const AboutInnerContent = ({ theme, right }: { theme: Theme; right?: boolean }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const queueSceneUpdate = useQueuedSceneUpdate();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["50% end", "80% end"],
  });

  useMotionValueEvent(scrollYProgress, "animationStart", () => {
    if (!right) return;
    queueSceneUpdate({ transition: 1 });
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (!right) return;
    queueSceneUpdate({
      themeLeft: "holographic",
      themeRight: "retro80",
      splitMode: "horizontal",
      transition: latest,
    });
  });

  return (
  <div ref={sectionRef} className="about-theme relative flex h-screen w-full flex-col py-30">
    <p className="theme-sub mb-2 ml-4 font-mono text-xs uppercase tracking-widest">
      01 — About
    </p>
    <div className="w-full h-0 border"/>
    <div className="grow w-full flex flex-col lg:flex-row">
      <div className="lg:w-[20vw] h-full theme-spacer" />
      <div className="grow theme-card flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-4xl font-bold leading-none tracking-tight lg:text-7xl">
          My philosophy
        </h2>
        {theme === "retro80" && (
          <CinematicNoiseOverlay
            intensity={0.22}
            artifactIntensity={0.4}
            fps={18}
            className="absolute inset-0"
          />
        )}
        <p className="theme-sub mt-6 max-w-xl text-center text-sm">
          I build interfaces that evolve through interaction.
        </p>
        <p className="m-6 max-w-xl text-center text-sm">
          My work focuses on immersive web experiences,
          interactive storytelling and reactive digital systems.

          I'm particularly interested in the space between
          interface design, motion and realtime rendering.
        </p>
      </div>
      <div className="lg:w-[20vw] h-full theme-spacer" />
    </div>
    <div className="w-full h-0 border"/>
  </div>
)};

type SectionThemeProps = {
  theme: Theme;
  right?: boolean;
};

const AboutOuter = ({ theme, right }: SectionThemeProps) => <AboutOuterContent theme={theme} right={right} />;

const AboutInner = ({ theme, right }: SectionThemeProps) => <AboutInnerContent theme={theme} right={right} />;

const About = { Outer: AboutOuter, Inner: AboutInner };
export default About;
