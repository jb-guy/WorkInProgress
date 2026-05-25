import { useEffect, useRef, useState, useCallback } from "react";
import { ThemeProvider, isDarkTheme, useTheme, type Theme } from "./context/ThemeContext";
import Nav, { type SectionId } from "./sections/Nav";
import Hero from "./sections/Hero";
import About from "./sections/About";
import Work from "./sections/Work";
import Process from "./sections/Process";
import Contact from "./sections/Contact";
import { SectionInteractionProvider } from "./context/SectionInteractionContext";


type ThemedSectionProps = { theme: Theme };

const SECTIONS: { id: SectionId; Outer: React.FC<ThemedSectionProps>; Inner: React.FC<ThemedSectionProps> }[] = [
  { id: "hero",    Outer: Hero.Outer,    Inner: Hero.Inner },
  { id: "about",    Outer: About.Outer,    Inner: About.Inner },
  { id: "work",    Outer: Work.Outer,    Inner: Work.Inner },
  { id: "process", Outer: Process.Outer, Inner: Process.Inner },
  { id: "contact", Outer: Contact.Outer, Inner: Contact.Inner },
];

type Point = { x: number; y: number };

const clipHalfPlane = (
  polygon: Point[],
  x0: number,
  y0: number,
  nx: number,
  ny: number,
  keepNegative: boolean,
) => {
  if (polygon.length === 0) return polygon;
  const result: Point[] = [];

  const sideValue = (point: Point) => (point.x - x0) * nx + (point.y - y0) * ny;
  const isInside = (value: number) => (keepNegative ? value <= 0 : value >= 0);

  for (let index = 0; index < polygon.length; index += 1) {
    const current = polygon[index];
    const next = polygon[(index + 1) % polygon.length];
    const currentSide = sideValue(current);
    const nextSide = sideValue(next);
    const currentInside = isInside(currentSide);
    const nextInside = isInside(nextSide);

    if (currentInside && nextInside) {
      result.push(next);
      continue;
    }

    if (currentInside !== nextInside) {
      const delta = nextSide - currentSide;
      if (Math.abs(delta) > 1e-6) {
        const t = -currentSide / delta;
        result.push({
          x: current.x + (next.x - current.x) * t,
          y: current.y + (next.y - current.y) * t,
        });
      }
    }

    if (!currentInside && nextInside) {
      result.push(next);
    }
  }

  return result;
};

const getSplitNormal = (splitMode: "vertical" | "horizontal" | "angled" | "overlaped", splitAngleDeg: number) => {
  if (splitMode === "horizontal") return { nx: 0, ny: 1 };
  if (splitMode === "vertical") return { nx: 1, ny: 0 };

  const angleFromVertical = (splitAngleDeg * Math.PI) / 180;
  const directionX = Math.sin(angleFromVertical);
  const directionY = Math.cos(angleFromVertical);
  return { nx: directionY, ny: directionX };
};

const applyClipPath = (
  element: HTMLDivElement | null,
  keepNegative: boolean,
  x0: number,
  y0: number,
  nx: number,
  ny: number,
) => {
  if (!element) return;
  const rect = element.getBoundingClientRect();
  const basePolygon: Point[] = [
    { x: rect.left, y: rect.top },
    { x: rect.right, y: rect.top },
    { x: rect.right, y: rect.bottom },
    { x: rect.left, y: rect.bottom },
  ];

  const clipped = clipHalfPlane(basePolygon, x0, y0, nx, ny, keepNegative);
  if (clipped.length < 3) {
    element.style = "clip-path: polygon(0 0, 0 0, 0 0); opacity: 1;";
    return;
  }

  const localPoints = clipped.map((point) => `${point.x - rect.left}px ${point.y - rect.top}px`);
  element.style = `clip-path: polygon(${localPoints.join(",")}); opacity: 1;`;
};

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
    setSplitX,
    setSplitY,
    splitX,
    splitY,
    splitMode,
    splitAngleDeg,
    themeRightOpacity,
    themeLeft,
    themeRight,
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
    if(splitMode === "overlaped") {
      const opacity = themeRightOpacity ?? 1;
      if (outerLeftClipRef.current) {
        outerLeftClipRef.current.style = `opacity: ${1 - opacity}; clip-path: none;`;
      }
      if (innerLeftClipRef.current) {
        innerLeftClipRef.current.style = `opacity: ${1 - opacity}; clip-path: none;`;
      }
      if (outerRightClipRef.current) {
        outerRightClipRef.current.style = `opacity: ${opacity}; clip-path: none;`;
      }
      if (innerRightClipRef.current) {
        innerRightClipRef.current.style = `opacity: ${opacity}; clip-path: none;`;
      }
      return;
    }

    const effectiveSplitX = splitX;
    const effectiveSplitY = splitMode === "horizontal" ? splitY : viewportHeight / 2;
    const { nx, ny } = getSplitNormal(splitMode, splitAngleDeg);

    applyClipPath(outerLeftClipRef.current, true, effectiveSplitX, effectiveSplitY, nx, ny);
    applyClipPath(outerRightClipRef.current, false, effectiveSplitX, effectiveSplitY, nx, ny);
    applyClipPath(innerLeftClipRef.current, true, effectiveSplitX, effectiveSplitY, nx, ny);
    applyClipPath(innerRightClipRef.current, false, effectiveSplitX, effectiveSplitY, nx, ny);
  }, [splitX, splitY, splitMode, splitAngleDeg, themeRightOpacity, viewportWidth, viewportHeight]);

  // ── Scroll sync ──────────────────────────────────────────────────────────
  useEffect(() => {
    const applyScrollFrame = () => {
      scrollRafRef.current = null;
      const currentScrollY = window.scrollY;

      if (appRootRef.current) {
        //appRootRef.current.style.setProperty("--scroll-y", `${currentScrollY}px`);
      }

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
      setSplitY(y);
      return;
    }
    const x = Math.max(40, Math.min(e.clientX, window.innerWidth - 40));
    setSplitX(x);
  }, [setSplitX, setSplitY, splitMode]);

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

  const effectiveSplitX = Math.max(40, Math.min(splitX, viewportWidth - 40));
  const effectiveSplitY = Math.max(40, Math.min(splitY, viewportHeight - 40));
  const dominantTheme: Theme =
    splitMode === "horizontal"
      ? effectiveSplitY >= viewportHeight / 2
        ? themeLeft
        : themeRight
      : effectiveSplitX >= viewportWidth / 2
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

      <div className="fixed inset-0 pointer-events-none">
        <div ref={outerLeftClipRef} className="absolute inset-0 overflow-hidden" data-theme={themeLeft}>
          <div
            ref={outerLeftStackRef}
            className="w-full"
            style={{ height: `${SECTIONS.length * 100}vh`, transform: "translate3d(0,0,0)", willChange: "transform" }}
          >
            {SECTIONS.map((section) => (
              <div key={`outer-left-${section.id}`} className="h-screen w-full">
                <section.Outer theme={themeLeft} />
              </div>
            ))}
          </div>
        </div>

        <div ref={outerRightClipRef} className="absolute inset-0 overflow-hidden" data-theme={themeRight}>
          <div
            ref={outerRightStackRef}
            className="w-full"
            style={{ height: `${SECTIONS.length * 100}vh`, transform: "translate3d(0,0,0)", willChange: "transform" }}
          >
            {SECTIONS.map((section) => (
              <div key={`outer-right-${section.id}`} className="h-screen w-full">
                <section.Outer theme={themeRight} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sticky Nav window (clipped) + scroll-synced inner stack ── */}
      <div className="absolute inset-0 pointer-events-none">
        <Nav activeSection={activeSection} dominantTheme={dominantTheme}>
          <div className="pointer-events-auto relative h-full w-full">
            <div ref={innerLeftClipRef} className="absolute inset-0 overflow-hidden" data-theme={themeLeft}>
              <div
                ref={innerLeftStackRef}
                className="w-full"
                style={{
                  height: `${SECTIONS.length * 100}vh`,
                  transform: "translate3d(0,0,0)",
                  willChange: "transform",
                }}
              >
                {SECTIONS.map((section) => (
                  <div key={`inner-left-${section.id}`} className="h-screen w-full">
                    <section.Inner theme={themeLeft} />
                  </div>
                ))}
              </div>
            </div>

            <div ref={innerRightClipRef} className="absolute inset-0 overflow-hidden" data-theme={themeRight}>
              <div
                ref={innerRightStackRef}
                className="w-full"
                style={{
                  height: `${SECTIONS.length * 100}vh`,
                  transform: "translate3d(0,0,0)",
                  willChange: "transform",
                }}
              >
                {SECTIONS.map((section) => (
                  <div key={`inner-right-${section.id}`} className="h-screen w-full">
                    <section.Inner theme={themeRight} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Nav>
      </div>

      {/* ── Outer stack (clipped) + scroll-synced inner stack ── */}
      <div className="relative">
        {SECTIONS.map((section, index) => (
          <div key={section.id} ref={(element) => { outerRefs.current[index] = element; }} className="h-screen" />
        ))}
      </div>

      {/* ── Fixed draggable split line ── */}
      <SplitHandle
        onPointerDown={onPointerDown}
        lineRef={splitLineRef}
        dominantTheme={dominantTheme}
      />

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
  const { splitX, splitY, splitMode, splitAngleDeg } = useTheme();
  const isDark = isDarkTheme(dominantTheme);
  const effectiveSplitX = Math.max(
    20,
    Math.min(splitX, typeof window !== "undefined" ? window.innerWidth - 20 : 1160)
  );
  const effectiveSplitY = Math.max(
    20,
    Math.min(splitY, typeof window !== "undefined" ? window.innerHeight - 20 : 760)
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
