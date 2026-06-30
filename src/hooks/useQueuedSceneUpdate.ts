import { useCallback, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { useSplitTransition, useTheme, type SplitMode, type Theme } from "../context/ThemeContext";

export type SceneUpdate = {
  themeRight?: Theme;
  themeLeft?: Theme;
  splitMode?: SplitMode;
  splitAngleDeg?: number;
  transition?: number;
  themeRightOpacity?: number;
};

const lastTransitionDetails = {current: null as SceneUpdate | null};

export const useQueuedSceneUpdate = () => {
  const { devMode, exploreMode, setThemeRight, setThemeLeft, dominantThemeOverride, setDominantTheme } = useTheme();
  const {
    setSplitMode,
    setSplitAngleDeg,
    setThemeRightOpacity,
    setTransition,
  } = useSplitTransition();

  const rafRef = useRef<number | null>(null);
  const pendingUpdateRef = useRef<SceneUpdate | null>(null);
  const lastDominantThemeRef = useRef<string>("wireframe");

  const queueSceneUpdate = useCallback((update: SceneUpdate) => {
    if (devMode || exploreMode) return;
    pendingUpdateRef.current = {
      ...pendingUpdateRef.current,
      ...update,
    };

    if (rafRef.current !== null) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      const next = pendingUpdateRef.current;
      pendingUpdateRef.current = null;
      if (!next) return;

      let dominantTheme = null;

      if (next.transition !== undefined && next.transition !== lastTransitionDetails.current?.transition) {
        setTransition(next.transition);
        const leftTheme = next.themeLeft || lastTransitionDetails.current?.themeLeft || "wireframe";
        const rightTheme = next.themeRight || lastTransitionDetails.current?.themeRight || "wireframe";
        if (!dominantThemeOverride && next.transition < 0.5 && lastDominantThemeRef.current !== leftTheme) {
          dominantTheme = leftTheme;
        } else if (!dominantThemeOverride && next.transition >= 0.5 && lastDominantThemeRef.current !== rightTheme) {
          dominantTheme = rightTheme;
        }
      }

      const shouldUpdate =
        (next.themeRight && next.themeRight !== lastTransitionDetails.current?.themeRight) ||
        (next.themeLeft && next.themeLeft !== lastTransitionDetails.current?.themeLeft) ||
        (next.splitMode && next.splitMode !== lastTransitionDetails.current?.splitMode) ||
        (next.splitAngleDeg !== undefined && next.splitAngleDeg !== lastTransitionDetails.current?.splitAngleDeg) ||
        (next.themeRightOpacity !== undefined && next.themeRightOpacity !== lastTransitionDetails.current?.themeRightOpacity) ||
        dominantTheme;

      if (!shouldUpdate) return;
      
      flushSync(() => {
        if (next.themeRight && next.themeRight !== lastTransitionDetails.current?.themeRight) {
          setThemeRight(next.themeRight);
        }
        if (next.themeLeft && next.themeLeft !== lastTransitionDetails.current?.themeLeft) {
          setThemeLeft(next.themeLeft);
        }
        if (next.splitMode && next.splitMode !== lastTransitionDetails.current?.splitMode) {
          setSplitMode(next.splitMode);
        }
        if (dominantTheme && dominantTheme !== lastDominantThemeRef.current) {
          setDominantTheme(dominantTheme);
          lastDominantThemeRef.current = dominantTheme;
        }
      });
      if (next.splitAngleDeg !== undefined && next.splitAngleDeg !== lastTransitionDetails.current?.splitAngleDeg) {
        setSplitAngleDeg(next.splitAngleDeg);
      }
      if (next.themeRightOpacity !== undefined && next.themeRightOpacity !== lastTransitionDetails.current?.themeRightOpacity) {
        setThemeRightOpacity(next.themeRightOpacity);
      }
      lastTransitionDetails.current = { ...lastTransitionDetails.current, ...next };
    });
  }, [devMode, exploreMode, dominantThemeOverride, setSplitAngleDeg, setSplitMode, setThemeRight, setThemeLeft, setThemeRightOpacity, setTransition]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  return queueSceneUpdate;
};