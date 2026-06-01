import { useRef, type ReactNode } from "react";
import { useSplitTransition, useTheme, type Theme, type SplitMode } from "../context/ThemeContext";

interface Props {
  /** render prop — receives the current theme string so sections can style themselves */
  children: (theme: Theme) => ReactNode;
  className?: string;
}

/**
 * Renders `children` twice side-by-side:
 *  - left half  → themeLeft,  clipped to [0, splitX] in viewport space
 *  - right half → themeRight, clipped to [splitX, ∞] in viewport space
 *
 * Both layers are `position: absolute inset-0`, so layout is identical.
 * The clip-path origin is corrected for the container's left offset so the
 * split aligns with the fixed-position drag handle regardless of padding.
 */
const SplitSection = ({ children, className = "" }: Props) => {
  const {
    themeLeft,
    themeRight,
  } = useTheme();
  const {
    transition,
    splitMode,
    splitAngleDeg,
  } = useSplitTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  const effectiveSplitX = Math.max(
    40,
    Math.min(transition, typeof window !== "undefined" ? window.innerWidth - 40 : 1160)
  );
  const effectiveSplitY = Math.max(
    40,
    Math.min(transition, typeof window !== "undefined" ? window.innerHeight - 40 : 760)
  );

  const getSplitNormal = (splitMode: SplitMode, splitAngleDeg: number) => {
    if (splitMode === "horizontal") return { nx: 0, ny: 1 };
    if (splitMode === "vertical") return { nx: 1, ny: 0 };

    const angleFromVertical = (splitAngleDeg * Math.PI) / 180;
    const directionX = Math.sin(angleFromVertical);
    const directionY = Math.cos(angleFromVertical);
    return { nx: directionY, ny: directionX };
  };

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

  const getClipPolygon = (keepNegative: boolean) => {
    if (!containerRef.current) {
      return keepNegative ? "polygon(0 0, 50% 0, 50% 100%, 0 100%)" : "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)";
    }

    const rect = containerRef.current.getBoundingClientRect();
    const { nx, ny } = getSplitNormal(splitMode, splitAngleDeg);
    const basePolygon = [
      { x: rect.left, y: rect.top },
      { x: rect.right, y: rect.top },
      { x: rect.right, y: rect.bottom },
      { x: rect.left, y: rect.bottom },
    ];
    const clipped = clipHalfPlane(
      basePolygon,
      effectiveSplitX,
      splitMode === "horizontal" ? effectiveSplitY : window.innerHeight / 2,
      nx,
      ny,
      keepNegative
    );

    if (clipped.length < 3) {
      return keepNegative ? "polygon(0 0, 0 0, 0 0)" : "polygon(0 0, 0 0, 0 0)";
    }

    const localPoints = clipped.map((point) => `${point.x - rect.left}px ${point.y - rect.top}px`);
    return `polygon(${localPoints.join(",")})`;
  };

  const leftClipPath = getClipPolygon(true);
  const rightClipPath = getClipPolygon(false);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {/* Left side */}
      <div
        data-theme={themeLeft}
        className="absolute inset-0"
        style={{ clipPath: leftClipPath }}
      >
        {children(themeLeft)}
      </div>

      {/* Right side */}
      <div
        data-theme={themeRight}
        className="absolute inset-0"
        style={{ clipPath: rightClipPath }}
      >
        {children(themeRight)}
      </div>
    </div>
  );
};

export default SplitSection;
