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

export const useQueuedSceneUpdate = () => {
  const { setThemeRight, setThemeLeft } = useTheme();
  const {
    setTransition,
    setSplitMode,
    setSplitAngleDeg,
    setThemeRightOpacity,
  } = useSplitTransition();

  const rafRef = useRef<number | null>(null);
  const pendingUpdateRef = useRef<SceneUpdate | null>(null);
  const lastTransitionRef = useRef<number>(-1);

  const queueSceneUpdate = useCallback((update: SceneUpdate) => {
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

      const nextTransition = next.transition;
      const shouldWriteTransition =
        nextTransition !== undefined && Math.abs(nextTransition - lastTransitionRef.current) >= 0.002;

      flushSync(() => {
        if (next.themeRight) {
          setThemeRight(next.themeRight);
        }
        if (next.themeLeft) {
          setThemeLeft(next.themeLeft);
        }
        if (next.splitMode) {
          setSplitMode(next.splitMode);
        }
        if (next.splitAngleDeg !== undefined) {
          setSplitAngleDeg(next.splitAngleDeg);
        }
        if (next.themeRightOpacity !== undefined) {
          setThemeRightOpacity(next.themeRightOpacity);
        }
        if (shouldWriteTransition && nextTransition !== undefined) {
          lastTransitionRef.current = nextTransition;
          setTransition(nextTransition);
        }
      });
    });
  }, [setSplitAngleDeg, setSplitMode, setThemeRight, setThemeLeft, setThemeRightOpacity, setTransition]);

  /* 
  useEffect(() => {
    return () => {
      console.log("Cleaning up scene update hook");
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []); */

  return queueSceneUpdate;
};