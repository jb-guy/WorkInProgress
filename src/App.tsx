import { useEffect, useRef, useState, useCallback } from "react";
import { type SplitMode, ThemeProvider, isDarkTheme, useTheme, type Theme } from "./context/ThemeContext";
import { NavControlsBar, NavStatusBadge, NavWindow, type SectionId } from "./sections/Nav";
import Hero from "./sections/Hero";
import About from "./sections/About";
import Work from "./sections/Work";
import Process from "./sections/Process";
import Contact from "./sections/Contact";
import { SectionInteractionProvider } from "./context/SectionInteractionContext";


type ThemedSectionProps = { theme: Theme, right?: boolean };

const SECTIONS: { id: SectionId; Outer: React.FC<ThemedSectionProps>; Inner: React.FC<ThemedSectionProps> }[] = [
  { id: "hero",    Outer: Hero.Outer,    Inner: Hero.Inner },
  { id: "about",    Outer: About.Outer,    Inner: About.Inner },
  { id: "work",    Outer: Work.Outer,    Inner: Work.Inner },
  { id: "process", Outer: Process.Outer, Inner: Process.Inner },
  { id: "contact", Outer: Contact.Outer, Inner: Contact.Inner },
];

const getTransitionStyle = (
  negative: boolean,
  splitMode: SplitMode,
  splitAngleDeg: number,
  transition: number,
  opacity?: number,
): string => {
  switch (splitMode) {
    case "vertical":
      return `clip-path: polygon(${transition * 100}% 0,100% 0, 100% 100%, ${transition * 100}% 100%)`;
    case "horizontal":
      return `clip-path: polygon(0% ${transition * 100}%, 100% ${transition * 100}%,100% 100%, 0% 100%)`;
    case "angled": 
      const overshoot = Math.abs(window.innerHeight * Math.tan((splitAngleDeg * Math.PI / 180)));
      const offset = -(window.innerWidth + overshoot) * transition;
      const p1x = window.innerWidth + (splitAngleDeg<0 ? overshoot : 0) + offset;
      const p2x = window.innerWidth + (splitAngleDeg>0 ? overshoot : 0) + offset;
      const p3x = 2*window.innerWidth  + overshoot + offset;
      return `clip-path: polygon(${p1x}px 100%, ${p2x}px 0, ${p3x}px 0, ${p3x}px 100%)`;
      
    case "overlaped":
      return `opacity: ${opacity}`;
    case "circle":
      const diagonale = Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2);
      return `clip-path: circle(${transition * diagonale/2}px at 50% 50%)`;
    case "square":
      return `clip-path: inset(${(1-transition)*50}% ${(1-transition)*50}% ${(1-transition)*50}% ${(1-transition)*50}%)`;
    default:
      return "";
  }
};

const applyClipPath = (
  element: HTMLDivElement | null,
  negative: boolean,
  splitMode: SplitMode,
  splitAngleDeg: number,
  transition: number,
  opacity?: number,
) => {
  if (!element) return;
  element.style = getTransitionStyle(negative, splitMode, splitAngleDeg, transition, opacity);
}

// ─── inner app, needs ThemeContext ────────────────────────────────────────────
function AppInner() {
  const [activeSection, setActiveSection] = useState<SectionId>("hero");
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 800
  );
  const {
    setTransition,
    transition,
    splitMode,
    splitAngleDeg,
    themeRightOpacity,
    themeLeft,
    themeRight,
    devMode,
  } = useTheme();

  const appRootRef   = useRef<HTMLDivElement>(null);

  const outerLeftClipRef = useRef<HTMLDivElement>(null);
  const outerRightClipRef = useRef<HTMLDivElement>(null);
  const innerLeftClipRef = useRef<HTMLDivElement>(null);
  const innerRightClipRef = useRef<HTMLDivElement>(null);

  const outerLeftStackRef = useRef<HTMLDivElement>(null);
  const outerRightStackRef = useRef<HTMLDivElement>(null);
  const innerLeftStackRef = useRef<HTMLDivElement>(null);
  const innerRightStackRef = useRef<HTMLDivElement>(null);

  const outerRefs    = useRef<(HTMLDivElement | null)[]>([]);
  const isDragging   = useRef(false);
  const splitLineRef = useRef<HTMLDivElement>(null);
  const scrollRafRef = useRef<number | null>(null);

  const updateRootClips = useCallback(() => {
    applyClipPath(outerRightClipRef.current, true, splitMode, splitAngleDeg, transition, themeRightOpacity);
    applyClipPath(innerRightClipRef.current, true, splitMode, splitAngleDeg, transition, themeRightOpacity);
  }, [transition, splitMode, splitAngleDeg, themeRightOpacity, viewportWidth, viewportHeight]);

  // ── Scroll sync ──────────────────────────────────────────────────────────
  useEffect(() => {
    const applyScrollFrame = () => {
      scrollRafRef.current = null;
      const currentScrollY = window.scrollY;

      const stackRefs = [
        outerLeftStackRef.current,
        outerRightStackRef.current,
        innerLeftStackRef.current,
        innerRightStackRef.current,
      ];
      stackRefs.forEach((stackRef) => {
        if (!stackRef) return;
        stackRef.style.transform = `translate3d(0, -${currentScrollY}px, 0)`;
      });

      updateRootClips();
    };

    const onScroll = () => {
      if (scrollRafRef.current !== null) return;
      scrollRafRef.current = window.requestAnimationFrame(applyScrollFrame);
    };

    applyScrollFrame();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollRafRef.current !== null) {
        window.cancelAnimationFrame(scrollRafRef.current);
      }
    };
  }, [updateRootClips]);

  useEffect(() => {
    const onResize = () => {
      setViewportWidth(window.innerWidth);
      setViewportHeight(window.innerHeight);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ── Section detection ─────────────────────────────────────────────────────
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    SECTIONS.forEach((section, i) => {
      const el = outerRefs.current[i];
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(section.id); },
        { threshold: 0.5 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // ── Draggable split line ──────────────────────────────────────────────────
  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging.current) return;
    if (splitMode === "horizontal") {
      const y = Math.max(40, Math.min(e.clientY, window.innerHeight - 40));
      setTransition(y / window.innerHeight);
      return;
    }
    const x = Math.max(40, Math.min(e.clientX, window.innerWidth - 40));
    setTransition(x / window.innerWidth);
  }, [setTransition, splitMode]);

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, [onPointerMove]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    document.body.style.cursor = splitMode === "horizontal" ? "ns-resize" : "ew-resize";
    document.body.style.userSelect = "none";
    e.currentTarget.setPointerCapture(e.pointerId);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  }, [onPointerMove, onPointerUp, splitMode]);

  const effectiveSplitX = Math.max(40, Math.min(transition * viewportWidth, viewportWidth - 40));
  const effectiveSplitY = Math.max(40, Math.min(transition * viewportHeight, viewportHeight - 40));
  const dominantTheme: Theme =
      transition <= 0.5
      ? themeLeft
      : themeRight;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      ref={appRootRef}
      className="relative"
      style={{
        "--scroll-y": "0px",
      } as React.CSSProperties}
    >

      <div className="fixed inset-0 pointer-events-none z-150">
        <div className="px-2 pt-2 lg:px-10 lg:pt-10">
          <NavControlsBar dominantTheme={dominantTheme} />
        </div>
        <NavStatusBadge activeSection={activeSection} dominantTheme={dominantTheme} />
      </div>

      <div className="fixed inset-0 pointer-events-auto">
        <div ref={outerLeftClipRef} className="absolute inset-0 overflow-hidden" data-theme={themeLeft}>
          <div
            ref={outerLeftStackRef}
            className="w-full will-change-scroll"
          >
            {SECTIONS.map((section) => (
              <div key={`outer-left-${section.id}`} className="w-full">
                <section.Outer theme={themeLeft} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div ref={innerLeftClipRef} className="fixed inset-0 overflow-hidden will-change-transform" data-theme={themeLeft}>
          <NavWindow dominantTheme={themeLeft}>
            <div
              ref={innerLeftStackRef}
              className="w-full will-change-scroll"
            >
              {SECTIONS.map((section) => (
                <div key={`inner-left-${section.id}`} className="w-full">
                  <section.Inner theme={themeLeft} />
                </div>
              ))}
            </div>
          </NavWindow>
        </div>
      </div>

      <div className="fixed inset-0 pointer-events-none">
        <div ref={outerRightClipRef} className="absolute inset-0 overflow-hidden will-change-transform" data-theme={themeRight}>
          <div
            ref={outerRightStackRef}
            className="w-full will-change-scroll"
          >
            {SECTIONS.map((section) => (
              <div key={`outer-right-${section.id}`} className="w-full pointer-events-auto">
                <section.Outer theme={themeRight} right />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div ref={innerRightClipRef} className="fixed inset-0 overflow-hidden will-change-transform" data-theme={themeRight}>
          <NavWindow dominantTheme={themeRight}>
            <div
              ref={innerRightStackRef}
              className="w-full will-change-scroll"
            >
              {SECTIONS.map((section) => (
                <div key={`inner-right-${section.id}`} className="w-full">
                  <section.Inner theme={themeRight} right />
                </div>
              ))}
            </div>
          </NavWindow>
        </div>
      </div>

      {/* ── Outer stack (clipped) + scroll-synced inner stack ── */}
      <div className="relative -z-1000">
        {SECTIONS.map((section, index) => (
          <div key={section.id} ref={(element) => { outerRefs.current[index] = element; }} className="h-screen" />
        ))}
      </div>

      {/* ── Fixed draggable split line ── */}
      {devMode && 
        <SplitHandle
          onPointerDown={onPointerDown}
          lineRef={splitLineRef}
          dominantTheme={dominantTheme}
        />
      }

    </div>
  );
}

// ─── Draggable handle UI ──────────────────────────────────────────────────────
function SplitHandle({
  onPointerDown,
  lineRef,
  dominantTheme,
}: {
  onPointerDown: (e: React.PointerEvent) => void;
  lineRef: React.RefObject<HTMLDivElement | null>;
  dominantTheme: Theme;
}) {
  const { transition, splitMode, splitAngleDeg } = useTheme();
  const isDark = isDarkTheme(dominantTheme);
  const effectiveSplitX = Math.max(
    20,
    Math.min(transition * (typeof window !== "undefined" ? window.innerWidth : 1160), typeof window !== "undefined" ? window.innerWidth - 20 : 1160)
  );
  const effectiveSplitY = Math.max(
    20,
    Math.min(transition * (typeof window !== "undefined" ? window.innerHeight : 760), typeof window !== "undefined" ? window.innerHeight - 20 : 760)
  );
  const lineClass = isDark ? "bg-white/30" : "bg-stone-900/35";
  const pipClass = isDark
    ? "border-white/40 bg-white/10"
    : "border-stone-900/30 bg-white/80";
  const dotClass = isDark ? "bg-white/70" : "bg-stone-900/70";

  const splitAngle = splitMode === "angled" ? splitAngleDeg : splitMode === "horizontal" ? 90 : 0;
  const lineStyle: React.CSSProperties ={
          top: "50%",
          width: "1px",
          height: "180vh",
          transform: `translate(-50%, -50%)`,
        };

  const handleStyle: React.CSSProperties =
    splitMode === "horizontal"
      ? {
          top: effectiveSplitY,
          left: "50%",
          transform: "translate(-50%, -50%) rotate(90deg)",
        }
      : {
          top: "50%",
          left: effectiveSplitX,
          transform: `translate(-50%, -50%) rotate(${splitAngle}deg)`,
        };

  const cursorClass = splitMode === "horizontal" ? "cursor-ns-resize" : "cursor-ew-resize";

  return (
    <div
      ref={lineRef}
      onPointerDown={onPointerDown}
      className={`fixed z-200 flex items-center justify-center select-none ${cursorClass}`}
      style={handleStyle}
    >
      <div className={`fixed pointer-events-none ${lineClass}`} style={lineStyle} />
      <div className={`flex h-8 w-4 flex-col items-center justify-center gap-0.75 rounded-full border backdrop-blur-sm ${pipClass}`}>
        <div className={`h-px w-2 ${dotClass}`} />
        <div className={`h-px w-2 ${dotClass}`} />
        <div className={`h-px w-2 ${dotClass}`} />
      </div>
    </div>
  );
}

// ─── Root with context ────────────────────────────────────────────────────────
export default function App() {
  return (
    <ThemeProvider>
      <SectionInteractionProvider>
        <AppInner />
      </SectionInteractionProvider>
    </ThemeProvider>
  );
}
