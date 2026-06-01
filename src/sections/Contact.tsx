import { useCallback, useEffect, useRef } from "react";
import { useSplitTransition, useTheme, type Theme } from "../context/ThemeContext";
import { useMotionValueEvent, useScroll } from "motion/react";

const ContactOuterContent = ({ theme }: { theme: Theme }) => (
  <div className="contact-theme theme-bg relative h-screen w-full overflow-hidden">
  </div>
);

const ContactInnerContent = ({ theme, right }: { theme: Theme; right?: boolean }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const pendingTransitionRef = useRef<number | null>(null);
  const lastTransitionRef = useRef<number>(-1);
  const { setThemeRight } = useTheme();
  const { setTransition, setSplitMode } = useSplitTransition();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["30% center", "40% center"],
  });

  const queueTransition = useCallback((value: number) => {
    const clamped = Math.max(0, Math.min(value, 1));
    pendingTransitionRef.current = clamped;
    if (rafRef.current !== null) return;

    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      const next = pendingTransitionRef.current;
      if (next === null) return;
      if (Math.abs(next - lastTransitionRef.current) < 0.002) return;
      lastTransitionRef.current = next;
      setTransition(next);
    });
  }, [setTransition]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);
  
  useMotionValueEvent(scrollYProgress, "animationStart", () => {
    if (!right) return;
    queueTransition(1);
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (!right) return;
    setThemeRight("cybernoir");
    setSplitMode("horizontal");
    queueTransition(1 - latest);
  });

  return (
  <div ref={sectionRef} className="contact-theme relative flex h-screen w-full flex-col py-30">
    <p className="theme-sub mb-2 ml-4 font-mono text-xs uppercase tracking-widest">
      06 — Contact
    </p>
    <div className="w-full h-0 border"/>
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
        <button onClick={() => window.location.href = "mailto:jeanbaptiste.guy2358@gmail.com"} className="theme-link mt-6">
          Send me an email
        </button>
        <button onClick={() => window.open("https://www.linkedin.com/in/your-profile", "_blank")} className="theme-link mt-4">
          Visit my LinkedIn
        </button>
      </div>
      <div className="min-w-[15vw] w-[20vw] h-full theme-spacer" />
    </div>
    <div className="w-full h-0 border"/>
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
