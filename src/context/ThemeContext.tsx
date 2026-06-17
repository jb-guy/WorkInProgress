import { createContext, useContext, useRef, useState, type ReactNode, type RefObject } from "react";

export const THEMES = ["wireframe", "dark", "cybernoir", "holographic", "retro80", "dreamscape"] as const;
export type Theme = (typeof THEMES)[number];
export const isDarkTheme = (theme: Theme) => theme === "dark" || theme === "cybernoir" || theme === "holographic";
export const SPLIT_MODES = ["vertical", "horizontal", "angled", "overlaped", "clip", "circle", "square"] as const;
export type SplitMode = (typeof SPLIT_MODES)[number];

interface ThemeContextValue {
  themeLeft: Theme;
  themeRight: Theme;
  devMode?: boolean;
  setThemeLeft: (t: Theme) => void;
  setThemeRight: (t: Theme) => void;
  setDevMode: (dev: boolean) => void;
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
  themeLeft: "dark",
  themeRight: "wireframe",
  devMode: false,
  setThemeLeft: () => {},
  setThemeRight: () => {},
  setDevMode: () => {},
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
  const transitionRef = useRef(0);

  const onTransitionUpdate = (callback: ()=>{}) => {
    window.addEventListener("styleTransitionUpdate", callback);
  }

  const setTransition = (x: number) => {
    transitionRef.current = x;
    window.dispatchEvent(new CustomEvent("styleTransitionUpdate", { detail: { transition: x } }));
  }
  const [splitMode, setSplitMode] = useState<SplitMode>("horizontal");
  const [splitAngleDeg, setSplitAngleDeg] = useState(18);
  const [themeRightOpacity, setThemeRightOpacity] = useState(1);
  const [devMode, setDevMode] = useState(false);

  return (
    <ThemeContext.Provider
      value={{
        themeLeft,
        themeRight,
        devMode,
        setThemeLeft,
        setThemeRight,
        setDevMode,
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
