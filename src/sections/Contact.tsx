import { useEffect, useRef } from "react";
import { useTheme, type Theme } from "../context/ThemeContext";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useQueuedSceneUpdate } from "../hooks/useQueuedSceneUpdate";

const ContactOuterContent = ({ theme }: { theme: Theme }) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const { setDominantTheme, exploreMode } = useTheme();

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ["30% end", "105% end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {

    if (latest > 0.5 && !exploreMode) setDominantTheme("deepspace");
    if (latest <= 0.5 && !exploreMode) setDominantTheme("dreamscape");
  });
  
  return (
  <div ref={outerRef} className="relative z-20 theme-bg h-screen w-full overflow-show">
    {theme != "wireframe" && (
      <motion.div style={{opacity: scrollYProgress}} className="absolute inset-0 z-10 ">
        <div className="absolute w-full h-[250vh] top-[-100vh] bg-black -z-5"></div>

        <div className="star-field bottom-0 h-1/2">
          <div className="layer"></div>
          <div className="layer"></div>
          <div className="layer"></div>
        </div>

      </motion.div>
    )}
  </div>
)};

const phoneMultiplier = window.innerWidth < 768 ? 1.5 : 1; // Adjust this value to control the speed of the parallax effect

const ContactInnerContent = ({ theme, right }: { theme: Theme; right?: boolean }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { setExploreMode } = useTheme();
  const queueSceneUpdate = useQueuedSceneUpdate();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["30% center", "80% center"],
  });

  useMotionValueEvent(scrollYProgress, "animationStart", () => {
    if (!right) return;
    queueSceneUpdate({ transition: 1 });
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (!right) return;
    queueSceneUpdate({
      themeLeft: "dreamscape",
      themeRight: "wireframe",
      splitMode: "circle",
      transition: latest * phoneMultiplier,
    });
  });

  return (
  <div ref={sectionRef} className="contact-theme relative flex h-screen w-full flex-col py-30">
    <p className="theme-sub mb-2 ml-4 font-mono text-xs uppercase tracking-widest">
      06 — Contact
    </p>
    <div className="w-full h-0 wireframe:border-t"/>
    <div className="grow w-full flex flex-row">
      <div className="min-w-[15vw] w-[20vw] h-full theme-spacer" />
      <div className="grow flex flex-col items-center justify-center text-center px-4">
        <h2 className="theme-title text-4xl  font-bold leading-none tracking-tight lg:text-7xl">
          Get in touch
        </h2>
        <p className="theme-sub mt-6 max-w-xl text-center text-sm">
          I’m currently open to new opportunities and collaborations.
        </p>
        <p className="theme-text mt-6 max-w-xl text-center text-sm">
          Whether you have a question, a project idea or just want to say hi, feel free to reach out.
        </p>
        <button onClick={() => window.location.href = "mailto:jeanbaptiste.guy2358@gmail.com"} className="theme-button mt-6">
          Send me an email
        </button>
        <button onClick={() => window.open("https://www.linkedin.com/in/your-profile", "_blank")} className="theme-button">
          Visit my LinkedIn
        </button>
        <button onClick={() => {if(window.innerWidth >= 768) {queueSceneUpdate({splitMode: "mouse"});} setExploreMode(true);}} className="theme-button">
          Behind the scenes
        </button>
      </div>
      <div className="min-w-[15vw] w-[20vw] h-full theme-spacer" />
    </div>
    <div className="w-full h-0 wireframe:border-t"/>
  </div>
)};

type SectionThemeProps = {
  theme: Theme;
  right?: boolean;
};

const ContactOuter = ({ theme }: SectionThemeProps) => <ContactOuterContent theme={theme} />;

const ContactInner = ({ theme, right }: SectionThemeProps) => <ContactInnerContent theme={theme} right={right} />;

const Contact = { Outer: ContactOuter, Inner: ContactInner };
export default Contact;
