import { use, useEffect, useRef } from "react";
import { useTheme, type Theme } from "../context/ThemeContext";
import { useMotionValueEvent, useScroll } from "motion/react";

const ContactOuterContent = ({ theme }: { theme: Theme }) => (
  <div className="contact-theme theme-bg relative h-full w-full overflow-hidden">
  </div>
);

const ContactInnerContent = ({ theme }: { theme: Theme }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { setThemeRight, setSplitY, setSplitMode } = useTheme();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["30% center", "40% center"],
  });
  
  useMotionValueEvent(scrollYProgress, "animationStart", () => {
    //Not working
    console.log("Contact section scroll animation started");
    setSplitY(window.innerHeight);
  });
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    //setThemeRight("synthwave");
    //setSplitMode("horizontal");
    setSplitY((1 - latest) * window.innerHeight);
  });

  return (
  <div ref={sectionRef} className="contact-theme relative flex h-full w-full flex-col py-30">
    <p className="theme-sub mb-2 ml-4 font-mono text-xs uppercase tracking-widest">
      06 — Contact
    </p>
    <div className="w-full h-0 border"/>
    <div className="grow w-full flex flex-row">
      <div className="min-w-[15vw] w-[20vw] h-full theme-spacer" />
      <div className="grow flex flex-col items-center justify-center text-center px-4">
        <h2 className="theme-text text-4xl  font-bold leading-none tracking-tight lg:text-7xl">
          Get in touch
        </h2>
        <p className="theme-sub mt-6 max-w-xl text-center text-sm">
          I’m currently open to new opportunities and collaborations.
        </p>
        <p className="theme-text mt-6 max-w-xl text-center text-sm">
          Whether you have a question, a project idea or just want to say hi, feel free to reach out.
        </p>
        <button onClick={() => window.location.href = "mailto:your-email@example.com"} className="theme-link mt-6">
          Send me an email
        </button>
      </div>
      <div className="min-w-[15vw] w-[20vw] h-full theme-spacer" />
    </div>
    <div className="w-full h-0 border"/>
  </div>
)};

type SectionThemeProps = {
  theme: Theme;
};

const ContactOuter = ({ theme }: SectionThemeProps) => <ContactOuterContent theme={theme} />;

const ContactInner = ({ theme }: SectionThemeProps) => <ContactInnerContent theme={theme} />;

const Contact = { Outer: ContactOuter, Inner: ContactInner };
export default Contact;
