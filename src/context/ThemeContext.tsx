import { createContext, useCallback, useContext, useRef, useState, type ReactNode, type RefObject } from "react";

export const THEMES = ["wireframe", "cybernoir", "holographic", "retro80", "dreamscape", "deepspace"] as const;
export type Theme = (typeof THEMES)[number];
export const isDarkTheme = (theme: Theme) => theme === "cybernoir" || theme === "holographic" || theme === "deepspace";
export const SPLIT_MODES = ["vertical", "horizontal", "angled", "overlaped", "clip", "circle", "square", "mouse"] as const;
export type SplitMode = (typeof SPLIT_MODES)[number];

interface ThemeContextValue {
  themeLeft: Theme;
  themeRight: Theme;
  devMode?: boolean;
  exploreMode?: boolean;
  dominantTheme: Theme;
  setDominantTheme: (theme: Theme) => void;
  setThemeLeft: (t: Theme) => void;
  setThemeRight: (t: Theme) => void;
  setDevMode: (dev: boolean) => void;
  setExploreMode: (explore: boolean) => void;
}

interface SplitTransitionContextValue {
  transitionRef: RefObject<number>; // [0, 1]
  splitMode: SplitMode;
  splitAngleDeg: number;
  themeRightOpacity?: number; // only used in "overlaped" mode, [0, 1]
  setTransition: (x: number) => void;
  setSplitMode: (mode: SplitMode) => void;
  setSplitAngleDeg: (angle: number) => void;
  setThemeRightOpacity: (opacity: number) => void;
  onTransitionUpdate?: (callback: ()=>{}) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  themeLeft: "wireframe",
  themeRight: "wireframe",
  dominantTheme: "wireframe",
  devMode: false,
  exploreMode: false,
  setThemeLeft: () => {},
  setThemeRight: () => {},
  setDominantTheme: () => {},
  setDevMode: () => {},
  setExploreMode: () => {},
});

const SplitTransitionContext = createContext<SplitTransitionContextValue>({
  transitionRef: { current: 0 },
  splitMode: "vertical",
  splitAngleDeg: 18,
  themeRightOpacity: 1,
  setTransition: () => {},
  setSplitMode: () => {},
  setSplitAngleDeg: () => {},
  setThemeRightOpacity: () => {},
  onTransitionUpdate: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeLeft, setThemeLeft] = useState<Theme>("wireframe");
  const [themeRight, setThemeRight] = useState<Theme>("wireframe");
  const [dominantTheme, setDominantTheme] = useState<Theme>("wireframe");
  const transitionRef = useRef(0);

  const onTransitionUpdate = (callback: ()=>{}) => {
    window.addEventListener("styleTransitionUpdate", callback);
  }

  const setTransition = useCallback((x: number) => {
    transitionRef.current = x;
    window.dispatchEvent(new CustomEvent("styleTransitionUpdate", { detail: { transition: x } }));
  }, []);

  const [splitMode, setSplitMode] = useState<SplitMode>("overlaped");
  const [splitAngleDeg, setSplitAngleDeg] = useState(18);
  const [themeRightOpacity, setThemeRightOpacity] = useState(0);
  const [devMode, setDevMode] = useState(false);
  const [exploreMode, setExploreMode] = useState(false);

  return (
    <ThemeContext.Provider
      value={{
        themeLeft,
        themeRight,
        dominantTheme,
        devMode,
        exploreMode,
        setThemeLeft,
        setThemeRight,
        setDevMode,
        setDominantTheme,
        setExploreMode,
      }}
    >
      <SplitTransitionContext.Provider
        value={{
          transitionRef: transitionRef,
          splitMode,
          splitAngleDeg,
          themeRightOpacity,
          setTransition,
          setSplitMode,
          setSplitAngleDeg,
          setThemeRightOpacity,
          onTransitionUpdate,
        }}
      >
        {children}
      </SplitTransitionContext.Provider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
export const useSplitTransition = () => useContext(SplitTransitionContext);
