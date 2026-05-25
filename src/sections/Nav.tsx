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

const Nav = (props: Props) => {
  const {
    themeLeft,
    themeRight,
    splitMode,
    splitAngleDeg,
    themeRightOpacity,
    setThemeLeft,
    setThemeRight,
    setSplitMode,
    setSplitAngleDeg,
    setThemeRightOpacity,
  } = useTheme();
  const activeLabel = props.activeSection ? SECTION_LABELS[props.activeSection] : "HERO";
  const dominantTheme = props.dominantTheme ?? themeLeft;
  const darkChrome = isDarkTheme(dominantTheme);

  const frameClass = darkChrome
    ? "border-white/30"
    : "border-stone-900/35";
  const separatorClass = darkChrome ? "border-white/25 text-white bg-black/20" : "border-stone-900/30 text-stone-900 bg-white/40";
  const subtleClass = darkChrome ? "text-white/70" : "text-stone-700/85";
  const selectClass = darkChrome ? "text-white/90 bg-black/25" : "text-stone-900 bg-white/65";

  return (
    <div className="h-0 w-full fixed z-100 top-0 left-0">
      <div className="h-screen p-2 lg:p-10 pointer-events-none">
        <div className={`h-full w-full border rounded-xl lg:rounded-2xl overflow-hidden pointer-events-none ${frameClass} transition-colors`}>
          <div className={`h-12 flex items-center justify-between pointer-events-auto backdrop-blur-[2px] ${separatorClass} border-b`}>
            <button className={`h-full w-16 border-r shrink-0 ${separatorClass}`} />
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
            <button className={`h-full w-30 border-l shrink-0 ${separatorClass}`}>Contact</button>
          </div>

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