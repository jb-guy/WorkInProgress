import { createContext, useContext, useState, type ReactNode } from "react";

export const THEMES = ["wireframe", "dark", "synthwave", "brutalist"] as const;
export type Theme = (typeof THEMES)[number];
export const isDarkTheme = (theme: Theme) => theme === "dark" || theme === "synthwave";
export const SPLIT_MODES = ["vertical", "horizontal", "angled", "overlaped"] as const;
export type SplitMode = (typeof SPLIT_MODES)[number];

interface ThemeContextValue {
  themeLeft: Theme;
  themeRight: Theme;
  splitX: number; // viewport px
  splitY: number; // viewport px
  splitMode: SplitMode;
  splitAngleDeg: number;
  themeRightOpacity?: number; // only used in "overlaped" mode, [0, 1]
  setThemeLeft: (t: Theme) => void;
  setThemeRight: (t: Theme) => void;
  setSplitX: (x: number) => void;
  setSplitY: (y: number) => void;
  setSplitMode: (mode: SplitMode) => void;
  setSplitAngleDeg: (angle: number) => void;
  setThemeRightOpacity?: (opacity: number) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  themeLeft: "dark",
  themeRight: "wireframe",
  splitX: typeof window !== "undefined" ? window.innerWidth / 2 : 600,
  splitY: typeof window !== "undefined" ? window.innerHeight / 2 : 400,
  splitMode: "vertical",
  splitAngleDeg: 18,
  themeRightOpacity: 1,
  setThemeLeft: () => {},
  setThemeRight: () => {},
  setSplitX: () => {},
  setSplitY: () => {},
  setSplitMode: () => {},
  setSplitAngleDeg: () => {},
  setThemeRightOpacity: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeLeft, setThemeLeft] = useState<Theme>("wireframe");
  const [themeRight, setThemeRight] = useState<Theme>("wireframe");
  const [splitX, setSplitX] = useState(
    typeof window !== "undefined" ? 20 : 20
  );
  const [splitY, setSplitY] = useState(
    typeof window !== "undefined" ? window.innerHeight / 2 : 400
  );
  const [splitMode, setSplitMode] = useState<SplitMode>("vertical");
  const [splitAngleDeg, setSplitAngleDeg] = useState(18);
  const [themeRightOpacity, setThemeRightOpacity] = useState(1);

  return (
    <ThemeContext.Provider
      value={{
        themeLeft,
        themeRight,
        splitX,
        splitY,
        splitMode,
        splitAngleDeg,
        themeRightOpacity,
        setThemeLeft,
        setThemeRight,
        setSplitX,
        setSplitY,
        setSplitMode,
        setSplitAngleDeg,
        setThemeRightOpacity,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
