import { useEffect, useLayoutEffect, useRef, useState, useCallback, useMemo } from "react";
import { isDarkTheme, useSplitTransition, useTheme, type SplitMode, type Theme } from "../context/ThemeContext";
import { NavBar, NavDevControls, NavExploreControls, NavStatusBadge, NavWindow, type SectionId } from "../sections/Nav";
import Hero from "../sections/Hero";
import About from "../sections/About";
import Work from "../sections/Work";
import Process from "../sections/Process";
import Contact from "../sections/Contact";
import { AnimatePresence, motion } from "motion/react";

type ThemedSectionProps = { theme: Theme; right?: boolean };

const SECTIONS: { id: SectionId; Outer: React.FC<ThemedSectionProps>; Inner: React.FC<ThemedSectionProps> }[] = [
  { id: "hero", Outer: Hero.Outer, Inner: Hero.Inner },
  { id: "about", Outer: About.Outer, Inner: About.Inner },
  { id: "work", Outer: Work.Outer, Inner: Work.Inner },
  { id: "process", Outer: Process.Outer, Inner: Process.Inner },
  { id: "contact", Outer: Contact.Outer, Inner: Contact.Inner },
];

const getTransitionStyle = (
  splitMode: SplitMode,
  splitAngleDeg: number,
  transition: number,
  opacity?: number,
): string => {
  switch (splitMode) {
    case "vertical":
      return `clip-path: polygon(${(1-transition) * 100}% 0,100% 0, 100% 100%, ${(1-transition) * 100}% 100%)`;
    case "horizontal":
      return `clip-path: polygon(0% ${(1 - transition) * 100}%, 100% ${(1 - transition) * 100}%,100% 100%, 0% 100%)`;
    case "angled": {
      const overshoot = Math.abs(window.innerHeight * Math.tan((splitAngleDeg * Math.PI) / 180));
      const offset = -(window.innerWidth + overshoot) * transition;
      const p1x = window.innerWidth + (splitAngleDeg < 0 ? overshoot : 0) + offset;
      const p2x = window.innerWidth + (splitAngleDeg > 0 ? overshoot : 0) + offset;
      const p3x = 2 * window.innerWidth + overshoot + offset;
      return `clip-path: polygon(${p1x}px 100%, ${p2x}px 0, ${p3x}px 0, ${p3x}px 100%)`;
    }
    case "overlaped":
      return `opacity: ${opacity}`;
    case "circle": {
      const diagonale = Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2);
      return `clip-path: circle(${(transition * diagonale) / 2}px at 50% 50%)`;
    }
    case "mouse": {
      const diagonale = Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2);
      return `clip-path: circle(${(transition * diagonale) / 2}px at var(--mouse-x, 50%) var(--mouse-y, 50%))`;
    }
    case "square":
      return `clip-path: inset(${(1 - transition) * 50}% ${(1 - transition) * 50}% ${(1 - transition) * 50}% ${(1 - transition) * 50}%)`;
    default:
      return "";
  }
};

const applyClipPath = (
  element: HTMLDivElement | null,
  splitMode: SplitMode,
  splitAngleDeg: number,
  transition: number,
  opacity?: number,
) => {
  if (!element) return;
  const nextStyle = getTransitionStyle(splitMode, splitAngleDeg, transition, opacity);
  if (element.dataset.clipCache === nextStyle) return;
  element.dataset.clipCache = nextStyle;
  element.style.cssText = nextStyle;
};

function SplitHandle({
  dominantTheme,
}: {
  dominantTheme: Theme;
}) {


  const { splitMode, splitAngleDeg, transitionRef, setTransition } = useSplitTransition();
  const isDark = isDarkTheme(dominantTheme);
  const lineRef = useRef<HTMLDivElement>(null);

  const effectiveSplitX = Math.max(
    20,
    Math.min((1-transitionRef.current) * (typeof window !== "undefined" ? window.innerWidth : 1160), typeof window !== "undefined" ? window.innerWidth - 20 : 1160)
  );
  const effectiveSplitY = Math.max(
    20,
    Math.min((1-transitionRef.current) * (typeof window !== "undefined" ? window.innerHeight : 760), typeof window !== "undefined" ? window.innerHeight - 20 : 760)
  );
  const pipClass = isDark ? "border-white/40 bg-white/10" : "border-stone-900/30 bg-white/80";
  const dotClass = isDark ? "bg-white/70" : "bg-stone-900/70";

  const splitAngle = splitMode === "angled" ? splitAngleDeg : splitMode === "horizontal" ? 90 : 0;

  const getHandleStyle = useCallback(() => {
    if(splitMode === "vertical"){
      const effectiveSplitX = Math.max(
        20,
        Math.min((1-transitionRef.current) * (typeof window !== "undefined" ? window.innerWidth : 1160), typeof window !== "undefined" ? window.innerWidth - 20 : 1160)
      );
      return {
        top: `50%`,
        left: `${effectiveSplitX}px`,
        transform: `translate(-50%, -50%)`,
      }
    } else if(splitMode === "horizontal"){
      const effectiveSplitY = Math.max(
        20,
        Math.min((1-transitionRef.current) * (typeof window !== "undefined" ? window.innerHeight : 760), typeof window !== "undefined" ? window.innerHeight - 20 : 760)
      );
      return {
        top: `${effectiveSplitY}px`,
        left: `50%`,
        transform: `translate(-50%, -50%) rotate(90deg)`,
      }
    } else if(splitMode === "angled"){
      const correction = Math.tan(((splitAngleDeg) * Math.PI) / 180)*(0.5-transitionRef.current)*(window.innerHeight/window.innerWidth);
      const effectiveSplitX = Math.max(
        20,
        Math.min((1-transitionRef.current+correction) * (typeof window !== "undefined" ? window.innerWidth : 1160), typeof window !== "undefined" ? window.innerWidth - 20 : 1160)
      );
      return {
        top: `50%`,
        left: `${effectiveSplitX}px`,
        transform: `translate(-50%, -50%) rotate(${splitAngle}deg)`,
      }
    } else if (splitMode === "circle") {
      const centerX = (typeof window !== "undefined" ? window.innerWidth : 1160) / 2;
      const centerY = (typeof window !== "undefined" ? window.innerHeight : 760) / 2;
      const diagonale = Math.sqrt((centerX*2) ** 2 + (centerY*2) ** 2);
      const radius = (transitionRef.current * diagonale) / 2;
      return {
        top: `50%`,
        left: `${centerX + radius}px`,
        transform: `translate(-50%, -50%)`,
      }
    } else if (splitMode === "square") {
      const centerX = (typeof window !== "undefined" ? window.innerWidth : 1160) / 2;
      const effectiveSplitX = Math.max(
        20,
        Math.min((transitionRef.current/2) * (typeof window !== "undefined" ? window.innerWidth : 1160), typeof window !== "undefined" ? window.innerWidth - 20 : 1160)
      );
      return {
        top: `50%`,
        left: `${centerX + effectiveSplitX}px`,
        transform: `translate(-50%, -50%)`,
      }
    }

    return {
      top: `50%`,
      left: `50%`,
      transform: `translate(-50%, -50%)`,
    }
  }, [splitMode, effectiveSplitX, effectiveSplitY, splitAngle]);

  const cursorClass = splitMode === "horizontal" ? "cursor-ns-resize" : "cursor-ew-resize";

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>|React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();

    const onPointerMove = (moveEvent: PointerEvent|TouchEvent) => {
      e.preventDefault();
      if(splitMode === "horizontal") {
        const newTransition = 1 - (moveEvent instanceof TouchEvent ? moveEvent.touches[0].clientY : moveEvent.clientY) / (typeof window !== "undefined" ? window.innerHeight : 760);
        setTransition(Math.max(0, Math.min(1, newTransition)));
      } 
      else if (splitMode === "vertical") {
        const newTransition = 1 - (moveEvent instanceof TouchEvent ? moveEvent.touches[0].clientX : moveEvent.clientX) / (typeof window !== "undefined" ? window.innerWidth : 1160);
        setTransition(Math.max(0, Math.min(1, newTransition)));
      }
      else if (splitMode === "angled") {
        const correction = Math.tan(((splitAngleDeg) * Math.PI) / 180)*(0.5-transitionRef.current)*(window.innerHeight/window.innerWidth);
        const newTransition = correction + 1 - (moveEvent instanceof TouchEvent ? moveEvent.touches[0].clientX : moveEvent.clientX) / (typeof window !== "undefined" ? window.innerWidth : 1160);

        setTransition(Math.max(0, Math.min(1, newTransition)));
      }
      else if (splitMode === "circle") {
        const centerX = (typeof window !== "undefined" ? window.innerWidth : 1160) / 2;
        const centerY = (typeof window !== "undefined" ? window.innerHeight : 760) / 2;
        const x = (moveEvent instanceof TouchEvent ? moveEvent.touches[0].clientX : moveEvent.clientX) - centerX;
        const y = (moveEvent instanceof TouchEvent ? moveEvent.touches[0].clientY : moveEvent.clientY) - centerY;
        const distance = Math.sqrt(x * x + y * y);
        const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
        const newTransition = distance / maxDistance;
        setTransition(Math.max(0, Math.min(1, newTransition)));
      }
      else if (splitMode === "square") {
        const newTransition = Math.abs((moveEvent instanceof TouchEvent ? moveEvent.touches[0].clientX : moveEvent.clientX) / (typeof window !== "undefined" ? window.innerWidth : 1160) * 2 - 1 );
        setTransition(Math.max(0, Math.min(1, newTransition)));
      }
    };

    const onPointerUp = () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("touchmove", onPointerMove);
      document.removeEventListener("touchend", onPointerUp);
    };

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("touchmove", onPointerMove, { passive: false });
    document.addEventListener("touchend", onPointerUp);
  };

  useEffect(() => {
    const updateLinePosition = () => {
      if (!lineRef.current) return;
      
      const handleStyle = getHandleStyle();
      lineRef.current.style.top = handleStyle.top;
      lineRef.current.style.left = handleStyle.left;
      lineRef.current.style.transform = handleStyle.transform;
    };

    window.addEventListener("styleTransitionUpdate", updateLinePosition);
    updateLinePosition();

    return () => {
      window.removeEventListener("styleTransitionUpdate", updateLinePosition);
    };
  }, [splitMode, splitAngle, transitionRef]);

  return (
    <div
      ref={lineRef}
      onPointerDown={onPointerDown}
      onTouchStart={onPointerDown}
      className={`fixed z-200 flex items-center justify-center select-none ${cursorClass} touch-none`}
      style={getHandleStyle()}
    >
      <div className={`flex h-8 w-4 flex-col items-center justify-center gap-0.75 rounded-full border backdrop-blur-sm ${pipClass}`}>
        <div className={`h-px w-2 ${dotClass}`} />
        <div className={`h-px w-2 ${dotClass}`} />
        <div className={`h-px w-2 ${dotClass}`} />
      </div>
    </div>
  );
}

export default function SplitViewport() {
  const [activeSection, setActiveSection] = useState<SectionId>("hero");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  const [viewportHeight, setViewportHeight] = useState(typeof window !== "undefined" ? window.innerHeight : 800);
  const { themeLeft, themeRight, dominantTheme, devMode, exploreMode } = useTheme();
  const { setTransition, splitMode, splitAngleDeg, themeRightOpacity,transitionRef } = useSplitTransition();

  const appRootRef = useRef<HTMLDivElement>(null);
  const outerLeftClipRef = useRef<HTMLDivElement>(null);
  const outerRightClipRef = useRef<HTMLDivElement>(null);
  const innerLeftClipRef = useRef<HTMLDivElement>(null);
  const innerRightClipRef = useRef<HTMLDivElement>(null);
  const outerLeftStackRef = useRef<HTMLDivElement>(null);
  const outerRightStackRef = useRef<HTMLDivElement>(null);
  const innerLeftStackRef = useRef<HTMLDivElement>(null);
  const innerRightStackRef = useRef<HTMLDivElement>(null);
  const outerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isDragging = useRef(false);
  const splitLineRef = useRef<HTMLDivElement>(null);
  const scrollRafRef = useRef<number | null>(null);


  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  // Handle scroll to section from menu
  const handleSectionClick = useCallback((sectionId: SectionId) => {
    const sectionIndex = SECTIONS.findIndex((s) => s.id === sectionId);
    if (sectionIndex === -1) return;

    const targetScrollY = sectionIndex * (typeof window !== "undefined" ? window.innerHeight : 800);
    window.scrollTo({
      top: targetScrollY,
      behavior: "smooth",
    });

    // Close menu after a brief delay to ensure scroll starts
    setTimeout(() => {
      closeMenu();
    }, 100);
  }, []);


  const updateRootClips = useCallback(() => {
    applyClipPath(outerRightClipRef.current, splitMode, splitAngleDeg, transitionRef.current, themeRightOpacity);
    applyClipPath(innerRightClipRef.current, splitMode, splitAngleDeg, transitionRef.current, themeRightOpacity);
  }, [splitMode, splitAngleDeg, themeRightOpacity]);

  useEffect(() => {
    const applyScrollFrame = () => {
      scrollRafRef.current = null;
      const currentScrollY = window.scrollY;

      [
        outerLeftStackRef.current,
        outerRightStackRef.current,
        innerLeftStackRef.current,
        innerRightStackRef.current,
      ].forEach((stackRef) => {
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
    window.addEventListener("styleTransitionUpdate", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("styleTransitionUpdate", onScroll);
      if (scrollRafRef.current !== null) {
        window.cancelAnimationFrame(scrollRafRef.current);
      }
    };
  }, [updateRootClips]);

  useLayoutEffect(() => {
    updateRootClips();
  }, [splitMode, splitAngleDeg, transitionRef.current, themeRightOpacity, updateRootClips]);

  useEffect(() => {
    const onResize = () => {
      setViewportWidth(window.innerWidth);
      setViewportHeight(window.innerHeight);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (splitMode !== "mouse") return;
    let rafId: number | null = null;
    let latestX = 0;
    let latestY = 0;
    const onMouseMove = (e: MouseEvent) => {
      latestX = e.clientX;
      latestY = e.clientY;
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        document.documentElement.style.setProperty("--mouse-x", `${latestX}px`);
        document.documentElement.style.setProperty("--mouse-y", `${latestY}px`);
      });
    };
    document.addEventListener("mousemove", onMouseMove);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [splitMode]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = (entry.target as HTMLElement).dataset.sectionId as SectionId | undefined;
            if (id) setActiveSection(id);
          }
        });
      },
      { threshold: 0.5 }
    );
    outerRefs.current.forEach((el, index) => {
      if (!el) return;
      el.dataset.sectionId = SECTIONS[index].id;
      obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging.current) return;
    if (splitMode === "horizontal") {
      const y = Math.max(40, Math.min(e.clientY, window.innerHeight - 40));
      setTransition((window.innerHeight - y) / window.innerHeight);
      return;
    }
    const x = Math.max(40, Math.min(e.clientX, window.innerWidth - 40));
    setTransition((window.innerWidth - x) / window.innerWidth);
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

  const outerLeftSections = useMemo(() => SECTIONS.map((section) => (
    <div key={`outer-left-${section.id}`} className="w-full">
      <section.Outer theme={themeLeft} />
    </div>
  )), [themeLeft]);

  const innerLeftSections = useMemo(() => SECTIONS.map((section) => (
    <div key={`inner-left-${section.id}`} className="w-full">
      <section.Inner theme={themeLeft} />
    </div>
  )), [themeLeft]);

  const outerRightSections = useMemo(() => SECTIONS.map((section) => (
    <div key={`outer-right-${section.id}`} className="w-full pointer-events-auto">
      <section.Outer theme={themeRight} right />
    </div>
  )), [themeRight]);

  const innerRightSections = useMemo(() => SECTIONS.map((section) => (
    <div key={`inner-right-${section.id}`} className="w-full">
      <section.Inner theme={themeRight} right />
    </div>
  )), [themeRight]);

  const spacerElement = useMemo(() => (
    <div className="relative -z-1000">
      {SECTIONS.map((section, index) => (
        <div key={section.id} ref={(element) => { outerRefs.current[index] = element; }} data-section-id={section.id} className="h-screen" />
      ))}
      {/* Add extra spacer at the end for phone */}
      <div className="h-[120vh] lg:h-0" />
    </div>
  ), []);

  return (
    <div ref={appRootRef} className="relative split-viewport" style={{ "--scroll-y": "0px" } as React.CSSProperties}>
      <div className="fixed inset-0 pointer-events-none z-150">
        <div className="px-2 pt-2 lg:px-10 lg:pt-10">
          <NavBar
            dominantTheme={dominantTheme}
            isMenuOpen={isMenuOpen}
            onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
          />
        </div>
        <NavStatusBadge activeSection={activeSection} dominantTheme={dominantTheme} />
      </div>

      <div className="fixed inset-0 pointer-events-auto">
        <div ref={outerLeftClipRef} className="absolute inset-0 overflow-hidden" data-theme={themeLeft}>
          <div ref={outerLeftStackRef} className="w-full scrolling-container will-change-transform">
            {outerLeftSections}
          </div>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div ref={innerLeftClipRef} className="fixed inset-0 overflow-hidden will-change-transform" data-theme={themeLeft}>
          <NavWindow
            dominantTheme={themeLeft}
            isMenuOpen={isMenuOpen}
            onMenuClose={closeMenu}
            activeSection={activeSection}
            onSectionClick={handleSectionClick}
          >
            <div ref={innerLeftStackRef} className="w-full scrolling-container will-change-transform">
              {innerLeftSections}
            </div>
          </NavWindow>
        </div>
      </div>

      <div className="fixed inset-0 pointer-events-none">
        <div ref={outerRightClipRef} className="absolute inset-0 overflow-hidden will-change-transform" data-theme={themeRight}>
          <div ref={outerRightStackRef} className="w-full scrolling-container will-change-transform">
            {outerRightSections}
          </div>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div ref={innerRightClipRef} className="fixed inset-0 overflow-hidden will-change-transform" data-theme={themeRight}>
          <NavWindow
            dominantTheme={themeRight}
            isMenuOpen={isMenuOpen}
            onMenuClose={closeMenu}
            activeSection={activeSection}
            onSectionClick={handleSectionClick}
          >
            <div ref={innerRightStackRef} className="w-full scrolling-container will-change-transform">
              {innerRightSections}
            </div>
          </NavWindow>
        </div>
      </div>

      {spacerElement}
      <AnimatePresence>
        {devMode && (
          <>
            <SplitHandle
              key="dev-split-handle"
              dominantTheme={dominantTheme}
            />
            <div className="fixed overflow-hidden bottom-2 lg:bottom-10 left-0 right-0 mx-2 lg:mx-10 h-12 rounded-b-xl lg:rounded-b-2xl z-100 pointer-events-none">
              <motion.div key="devcontrols" initial={{y:64}} animate={{y: 0}} transition={{ ease: "circOut" }} className="h-full w-full pointer-events-auto">
                <NavDevControls
                  dominantTheme={dominantTheme}
                />
              </motion.div>

            </div>
          </>
        )}
        {exploreMode && (
          <>
            {(splitMode !== "mouse" && splitMode !== "overlaped") && (
              <SplitHandle
                dominantTheme={dominantTheme}
              />
            )}
            <div className="fixed overflow-hidden bottom-2 lg:bottom-10 left-0 right-0 mx-2 lg:mx-10 h-24 lg:h-12 rounded-b-xl lg:rounded-b-2xl z-100 pointer-events-none">
              <motion.div key="controls" initial={{y:"100%"}} animate={{y: 0}} transition={{ ease: "circOut" }} className="h-full w-full pointer-events-auto">
                <NavExploreControls
                  dominantTheme={dominantTheme}
                />
              </motion.div>

            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}