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
  const { devMode, exploreMode, setThemeRight, setThemeLeft, dominantTheme, setDominantTheme } = useTheme();
  const {
    setSplitMode,
    setSplitAngleDeg,
    setThemeRightOpacity,
    setTransition,
  } = useSplitTransition();

  const rafRef = useRef<number | null>(null);
  const pendingUpdateRef = useRef<SceneUpdate | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const lastDominantThemeRef = useRef<string>("left");

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

      lastUpdateTimeRef.current = Date.now();
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
        if (next.splitAngleDeg !== undefined && next.splitAngleDeg !== lastTransitionDetails.current?.splitAngleDeg) {
          setSplitAngleDeg(next.splitAngleDeg);
        }
        if (next.themeRightOpacity !== undefined && next.themeRightOpacity !== lastTransitionDetails.current?.themeRightOpacity) {
          setThemeRightOpacity(next.themeRightOpacity);
        }
        if (next.transition !== undefined && next.transition !== lastTransitionDetails.current?.transition) {
          setTransition(next.transition);
          if (dominantTheme != "deepspace" && next.transition < 0.5 && lastDominantThemeRef.current !== dominantTheme) {
            setDominantTheme(next.themeLeft || lastTransitionDetails.current?.themeLeft || dominantTheme);
          } else if (dominantTheme != "deepspace" && next.transition >= 0.5 && lastDominantThemeRef.current !== dominantTheme) {
            setDominantTheme(next.themeRight || lastTransitionDetails.current?.themeRight || dominantTheme);
          }
        }
      });
      lastTransitionDetails.current = { ...lastTransitionDetails.current, ...next };
    });
  }, [devMode, exploreMode, dominantTheme, setSplitAngleDeg, setSplitMode, setThemeRight, setThemeLeft, setThemeRightOpacity, setTransition]);

  /*useEffect(() => {
    return () => {
      console.log("Cleaning up scene update hook");
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);*/

  return queueSceneUpdate;
};