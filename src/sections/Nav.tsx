import {
  SPLIT_MODES,
  THEMES,
  isDarkTheme,
  useTheme,
  type SplitMode,
  type Theme,
} from "../context/ThemeContext";

export type SectionId = "hero" | "about" | "process" | "work" | "contact";

type Props = {
  children?: React.ReactNode;
  activeSection?: SectionId;
  dominantTheme?: Theme;
};

type NavChromeProps = {
  dominantTheme: Theme;
};

type NavWindowProps = {
  children?: React.ReactNode;
  dominantTheme: Theme;
};

type NavStatusProps = {
  activeSection?: SectionId;
  dominantTheme: Theme;
};

const SECTION_LABELS: Record<SectionId, string> = {
  hero: "HERO",
  about: "ABOUT",
  process: "PROCESS",
  work: "WORK",
  contact: "CONTACT",
};

const ThemeSelect = ({
  value,
  onChange,
  label,
  selectClass,
}: {
  value: Theme;
  onChange: (t: Theme) => void;
  label: string;
  selectClass: string;
}) => (
  <div className="flex items-center gap-1 px-2 text-[0.65rem] font-mono">
    <span className="opacity-50">{label}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as Theme)}
      className={`rounded px-1 py-0.5 border-none outline-none cursor-pointer uppercase tracking-wide ${selectClass}`}
    >
      {THEMES.map((theme) => (
        <option key={theme} value={theme}>
          {theme}
        </option>
      ))}
    </select>
  </div>
);

const getPalette = (theme: Theme) => {
  const darkChrome = isDarkTheme(theme);
  return {
    frameClass: darkChrome ? "border-white/30" : "border-stone-900/35",
    separatorClass: darkChrome
      ? "border-white/25 text-white bg-black/20"
      : "border-stone-900/30 text-stone-900 bg-white/40",
    subtleClass: darkChrome ? "text-white/70" : "text-stone-700/85",
    selectClass: darkChrome ? "text-white/90 bg-black/25" : "text-stone-900 bg-white/65",
  };
};

export const NavControlsBar = ({ dominantTheme }: NavChromeProps) => {
  const {
    themeLeft,
    themeRight,
    splitMode,
    splitAngleDeg,
    themeRightOpacity,
    devMode,
    setThemeLeft,
    setThemeRight,
    setSplitMode,
    setSplitAngleDeg,
    setThemeRightOpacity,
    setDevMode,
  } = useTheme();
  const { separatorClass, selectClass } = getPalette(dominantTheme);

  return (
    <div className={`h-12 flex items-center justify-between pointer-events-auto backdrop-blur-[2px] ${separatorClass} border rounded-t-xl lg:rounded-t-2xl`}>
      <button className={`h-full w-16 border-r shrink-0 ${separatorClass}`}>
        <div className="h-px w-4 bg-current mx-auto" />
        <div className="h-px w-4 bg-current mx-auto mt-1" />
        <div className="h-px w-4 bg-current mx-auto mt-1" />
      </button>
      {(devMode) && <>
        <div className="flex items-center gap-2">
          <ThemeSelect value={themeLeft} onChange={setThemeLeft} label="L:" selectClass={selectClass} />
          <span className="opacity-30 text-xs">|</span>
          <ThemeSelect value={themeRight} onChange={setThemeRight} label="R:" selectClass={selectClass} />
        </div>
        <div className="flex items-center gap-1 px-2 text-[0.62rem] font-mono pointer-events-auto">
          <span className="opacity-60">Split:</span>
          <select
            value={splitMode}
            onChange={(event) => setSplitMode(event.target.value as SplitMode)}
            className={`rounded px-1 py-0.5 border-none outline-none cursor-pointer uppercase tracking-wide ${selectClass}`}
          >
            {SPLIT_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
          {splitMode === "angled" && (
            <input
              type="range"
              min={-75}
              max={75}
              step={1}
              value={splitAngleDeg}
              onChange={(event) => setSplitAngleDeg(Number(event.target.value))}
              className="w-20 accent-current"
              aria-label="Split angle"
            />
          )}
          {splitMode === "overlaped" && (
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={themeRightOpacity}
              onChange={(event) => setThemeRightOpacity?.(Number(event.target.value))}
              className="w-20 accent-current"
              aria-label="Right theme opacity"
            />
          )}
        </div>
      </>}
      <button className={`h-full w-30 border-l shrink-0 ${separatorClass}`} onClick={()=>{setDevMode(!devMode)}} >Contact</button>
    </div>
  );
};

export const NavStatusBadge = ({ activeSection, dominantTheme }: NavStatusProps) => {
  const activeLabel = activeSection ? SECTION_LABELS[activeSection] : "HERO";
  const { separatorClass, subtleClass } = getPalette(dominantTheme);

  return (
    <div className={`absolute top-14 right-2 lg:top-22 lg:right-10 border-b border-l w-36 text-[0.6rem] p-1 z-10 pointer-events-none ${separatorClass} ${subtleClass}`}>
      SYSTEM STATUS: UNSTABLE <br />
      INITIALIZING: {activeLabel} <br />
      BUILD: {dominantTheme.toUpperCase()}
    </div>
  );
};

export const NavWindow = ({ children, dominantTheme }: NavWindowProps) => {
  const { frameClass } = getPalette(dominantTheme);

  return (
    <div className="h-screen w-full fixed p-2 lg:p-10 lg:pt-22 pointer-events-none">
      <div className={`h-full w-full border border-t-0 rounded-b-xl lg:rounded-b-2xl overflow-hidden pointer-events-none ${frameClass} transition-colors`}>
        <div className="h-screen w-full overflow-hidden -mt-14 lg:-mt-22">{children}</div>
      </div>
    </div>
  );
};

const Nav = (props: Props) => {
  const { themeLeft } = useTheme();
  const activeLabel = props.activeSection ? SECTION_LABELS[props.activeSection] : "HERO";
  const dominantTheme = props.dominantTheme ?? themeLeft;
  const { frameClass, separatorClass, subtleClass } = getPalette(dominantTheme);

  return (
    <div className="h-0 w-full fixed z-100 top-0 left-0">
      <div className="h-screen p-2 lg:p-10 pointer-events-none">
        <div className={`h-full w-full border rounded-xl lg:rounded-2xl overflow-hidden pointer-events-none ${frameClass} transition-colors`}>
          <NavControlsBar dominantTheme={dominantTheme} />

          <div className="relative h-screen w-full overflow-hidden">
            <div className={`absolute top-0 right-0 border-b border-l w-36 text-[0.6rem] p-1 z-10 pointer-events-none ${separatorClass} ${subtleClass}`}>
              SYSTEM STATUS: UNSTABLE <br />
              INITIALIZING: {activeLabel} <br />
              BUILD: {dominantTheme.toUpperCase()}
            </div>
            <div className="h-full w-full overflow-hidden -mt-14 lg:-mt-22">{props.children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nav;