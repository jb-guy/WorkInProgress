import { useState } from "react";
import {
  SPLIT_MODES,
  THEMES,
  isDarkTheme,
  useSplitTransition,
  useTheme,
  type SplitMode,
  type Theme,
} from "../context/ThemeContext";
import { SectionMenu } from "../components/SectionMenu";
import {AnimatePresence, motion, useScroll} from "motion/react"

export type SectionId = "hero" | "about" | "process" | "work" | "contact";

type Props = {
  children?: React.ReactNode;
  activeSection?: SectionId;
  dominantTheme?: Theme;
};

type NavChromeProps = {
  dominantTheme: Theme;
  isMenuOpen?: boolean;
  onMenuToggle?: () => void;
};

type NavWindowProps = {
  children?: React.ReactNode;
  dominantTheme: Theme;
  isMenuOpen: boolean;
  onMenuClose?: () => void;
  activeSection?: SectionId;
  onSectionClick?: (sectionId: SectionId) => void;
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
    frameClass: darkChrome ? "border-white/50" : "border-stone-900/35",
    separatorClass: darkChrome
      ? "border-white/25 text-white bg-black/20"
      : "border-stone-900/30 text-stone-900 bg-white/40",
    subtleClass: darkChrome ? "text-white/70" : "text-stone-700/85",
    selectClass: darkChrome ? "text-white/90 bg-black/25" : "text-stone-900 bg-white/65",
    svgFill: darkChrome ? "fill-white/90" : "fill-stone-900/90",
  };
};

export const NavBar = ({ dominantTheme, isMenuOpen, onMenuToggle }: NavChromeProps) => {
  const { scrollYProgress } = useScroll();
  const {
    devMode,
    setDevMode,
  } = useTheme();
  const { separatorClass } = getPalette(dominantTheme);
  return (
    <div className={`h-12 flex items-center justify-between pointer-events-auto backdrop-blur-xs ${separatorClass} overflow-hidden border rounded-t-xl lg:rounded-t-2xl`}>
      <button
        onClick={onMenuToggle}
        className={`h-full w-16 border-r shrink-0 ${separatorClass} transition-opacity hover:opacity-70`}
        aria-label="Toggle navigation menu"
        aria-pressed={isMenuOpen}
      >
        <div className="h-px w-4 bg-current mx-auto" />
        <div className="h-px w-4 bg-current mx-auto mt-1" />
        <div className="h-px w-4 bg-current mx-auto mt-1" />
      </button>
      <div className="h-full w-full">
        <motion.div
          className={`${separatorClass} h-full w-full origin-left`}
          style={{ scaleX: scrollYProgress }}
        />
      </div>
      <button className={`h-full w-30 border-l shrink-0 ${separatorClass}`} onClick={()=>{setDevMode(!devMode)}} >Contact</button>
    </div>
  );
};

export const NavExploreControls = ({ dominantTheme, isMenuOpen, onMenuToggle }: NavChromeProps) => {
  const {
    splitMode,
    splitAngleDeg,
    themeRightOpacity,
    setSplitMode,
    setSplitAngleDeg,
    setThemeRightOpacity,
  } = useSplitTransition();
  const {
    themeLeft,
    setThemeLeft,
    setExploreMode,
    setDominantTheme,
  } = useTheme();
  const { separatorClass, frameClass, svgFill } = getPalette(dominantTheme);
  return (
    <div className={`h-full flex items-center justify-between pointer-events-auto backdrop-blur-xs ${separatorClass} border rounded-b-xl lg:rounded-b-2xl ${frameClass} overflow-hidden`}>
        <div className="flex flex-col h-full lg:flex-row lg:items-center justify-center gap-2">
          <div className="flex items-center gap-1 px-2 text-[0.65rem] font-mono">
            <p className="ml-4 text-sub text-xs opacity-60">Theme:</p>
            {THEMES.slice(1).map((theme, index) => (
              <button
                key={index}
                data-theme={theme}
                className={`h-6 w-6 bg-primary rounded-full ${theme === themeLeft ? "border-2 border-current" : ""}`}
                onClick={() => { setThemeLeft(theme); setDominantTheme(theme); }}
              />
            ))}
          </div>
          <div className={`flex ${svgFill} items-center gap-1 px-2 text-[0.65rem] font-mono`}>
          <span className="opacity-30 hidden lg:inline text-xs">|</span>
           <p className="ml-4 text-sub text-xs opacity-60">Split:</p>
           {/* vertical button icon */}
          <button
            className={`h-6 w-6 flex items-center justify-center ${splitMode === "vertical" ? "border-2 border-current" : ""}`}
            onClick={() => setSplitMode("vertical")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M288 128C288 110.3 273.7 96 256 96C238.3 96 224 110.3 224 128L224 512C224 529.7 238.3 544 256 544C273.7 544 288 529.7 288 512L288 128zM416 128C416 110.3 401.7 96 384 96C366.3 96 352 110.3 352 128L352 512C352 529.7 366.3 544 384 544C401.7 544 416 529.7 416 512L416 128z"/></svg>
          </button>
          {/* horizontal button icon */}
          <button
            className={`h-6 w-6 flex items-center justify-center ${splitMode === "horizontal" ? "border-2 border-current" : ""}`}
            onClick={() => setSplitMode("horizontal")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M128 352C110.3 352 96 366.3 96 384C96 401.7 110.3 416 128 416L512 416C529.7 416 544 401.7 544 384C544 366.3 529.7 352 512 352L128 352zM128 224C110.3 224 96 238.3 96 256C96 273.7 110.3 288 128 288L512 288C529.7 288 544 273.7 544 256C544 238.3 529.7 224 512 224L128 224z"/></svg>
          </button>
          {/* angled button icon */}
          <button
            className={`h-6 w-6 flex items-center justify-center ${splitMode === "angled" ? "border-2 border-current" : ""}`}
            onClick={() => setSplitMode("angled")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M318.4 138.1C324 121.3 314.9 103.2 298.2 97.6C281.5 92 263.3 101.1 257.7 117.8L129.7 501.8C124.1 518.6 133.2 536.7 149.9 542.3C166.6 547.9 184.8 538.8 190.4 522.1L318.4 138.1zM389.3 96.4C371.9 93.5 355.4 105.3 352.5 122.7L288.5 506.7C285.6 524.1 297.4 540.6 314.8 543.5C332.2 546.4 348.7 534.6 351.6 517.2L415.6 133.2C418.5 115.8 406.7 99.3 389.3 96.4zM480 96C462.3 96 448 110.3 448 128L448 512C448 529.7 462.3 544 480 544C497.7 544 512 529.7 512 512L512 128C512 110.3 497.7 96 480 96z"/></svg>
          </button>
          {/* overlaped button icon */}
          <button
            className={`h-6 w-6 flex items-center justify-center ${splitMode === "overlaped" ? "border-2 border-current" : ""}`}
            onClick={() => {setSplitMode("overlaped");setThemeRightOpacity?.(0.5);}}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M296.5 69.2C311.4 62.3 328.6 62.3 343.5 69.2L562.1 170.2C570.6 174.1 576 182.6 576 192C576 201.4 570.6 209.9 562.1 213.8L343.5 314.8C328.6 321.7 311.4 321.7 296.5 314.8L77.9 213.8C69.4 209.8 64 201.3 64 192C64 182.7 69.4 174.1 77.9 170.2L296.5 69.2zM112.1 282.4L276.4 358.3C304.1 371.1 336 371.1 363.7 358.3L528 282.4L562.1 298.2C570.6 302.1 576 310.6 576 320C576 329.4 570.6 337.9 562.1 341.8L343.5 442.8C328.6 449.7 311.4 449.7 296.5 442.8L77.9 341.8C69.4 337.8 64 329.3 64 320C64 310.7 69.4 302.1 77.9 298.2L112 282.4zM77.9 426.2L112 410.4L276.3 486.3C304 499.1 335.9 499.1 363.6 486.3L527.9 410.4L562 426.2C570.5 430.1 575.9 438.6 575.9 448C575.9 457.4 570.5 465.9 562 469.8L343.4 570.8C328.5 577.7 311.3 577.7 296.4 570.8L77.9 469.8C69.4 465.8 64 457.3 64 448C64 438.7 69.4 430.1 77.9 426.2z"/></svg>

          </button>
          {/* circle button icon */}
          <button
            className={`h-6 w-6 flex items-center justify-center ${splitMode === "circle" ? "border-2 border-current" : ""}`}
            onClick={() => setSplitMode("circle")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M320 64C176.5 64 64 176.5 64 320C64 463.5 176.5 576 320 576C463.5 576 576 463.5 576 320C576 176.5 463.5 64 320 64zM320 512C213.1 512 128 426.9 128 320C128 213.1 213.1 128 320 128C426.9 128 512 213.1 512 320C512 426.9 426.9 512 320 512z"/></svg>
          </button>
          {/* square button icon */}
          <button
            className={`h-6 w-6 flex items-center justify-center ${splitMode === "square" ? "border-2 border-current" : ""}`}
            onClick={() => setSplitMode("square")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M128 128C110.3 128 96 142.3 96 160L96 480C96 497.7 110.3 512 128 512L512 512C529.7 512 544 497.7 544 480L544 160C544 142.3 529.7 128 512 128L128 128zM128 160L512 160L512 480L128 480L128 160z"/></svg>
          </button>
          {/* cursor button icon */}
          {window.innerWidth >= 768 && (
            <button
              className={`h-6 w-6 flex items-center justify-center ${splitMode === "mouse" ? "border-2 border-current" : ""}`}
              onClick={() => setSplitMode("mouse")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M173.3 66.5C181.4 62.4 191.2 63.3 198.4 68.8L518.4 308.7C526.7 314.9 530 325.7 526.8 335.5C523.6 345.3 514.4 351.9 504 351.9L351.7 351.9L440.6 529.6C448.5 545.4 442.1 564.6 426.3 572.5C410.5 580.4 391.3 574 383.4 558.2L294.5 380.5L203.2 502.3C197 510.6 186.2 513.9 176.4 510.7C166.6 507.5 160 498.3 160 488L160 88C160 78.9 165.1 70.6 173.3 66.5z"/></svg>
            </button>

          )}

          </div>
          
          
          
        </div>
        <button className={`h-6 w-6 mr-3`} onClick={() => setExploreMode(false)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M183.1 137.4C170.6 124.9 150.3 124.9 137.8 137.4C125.3 149.9 125.3 170.2 137.8 182.7L275.2 320L137.9 457.4C125.4 469.9 125.4 490.2 137.9 502.7C150.4 515.2 170.7 515.2 183.2 502.7L320.5 365.3L457.9 502.6C470.4 515.1 490.7 515.1 503.2 502.6C515.7 490.1 515.7 469.8 503.2 457.3L365.8 320L503.1 182.6C515.6 170.1 515.6 149.8 503.1 137.3C490.6 124.8 470.3 124.8 457.8 137.3L320.5 274.7L183.1 137.4z"/></svg>
        </button>
    </div>
  );
};

export const NavDevControls = ({ dominantTheme, isMenuOpen, onMenuToggle }: NavChromeProps) => {
  const {
    splitMode,
    splitAngleDeg,
    themeRightOpacity,
    setSplitMode,
    setSplitAngleDeg,
    setThemeRightOpacity,
  } = useSplitTransition();
  const {
    themeLeft,
    themeRight,
    setThemeLeft,
    setThemeRight,
  } = useTheme();
  const { separatorClass, selectClass } = getPalette(dominantTheme);
  return (
    <div className={`h-full flex items-center justify-between pointer-events-auto backdrop-blur-xs ${separatorClass} overflow-hidden`}>
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
            {SPLIT_MODES.map((mode,index) => (
              <option key={index} value={mode}>
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
    </div>
  );
};

export const NavStatusBadge = ({ activeSection, dominantTheme }: NavStatusProps) => {
  const activeLabel = activeSection ? SECTION_LABELS[activeSection] : "HERO";
  const { separatorClass, subtleClass } = getPalette(dominantTheme);

  return (
    <div className={`absolute top-14 right-2 lg:top-22 lg:right-10 border-b border-l w-36 text-[0.6rem] p-1 z-10 pointer-events-none ${separatorClass} ${subtleClass}`}>
      SYSTEM: UNSTABLE <br />
      INITIALIZING: {activeLabel} <br />
      BUILD: {dominantTheme.toUpperCase()}
    </div>
  );
};

export const NavWindow = ({
  children,
  dominantTheme,
  isMenuOpen,
  onMenuClose,
  activeSection,
  onSectionClick,
}: NavWindowProps) => {
  const { frameClass } = getPalette(dominantTheme);

  return (
    <div className="h-screen w-full fixed p-2 lg:p-10 pt-14 lg:pt-22 pointer-events-none">
      <div className={`h-full w-full border border-t-0 rounded-b-xl lg:rounded-b-2xl overflow-hidden pointer-events-none ${frameClass} transition-colors relative`}>
        {onMenuClose && onSectionClick && (
            <SectionMenu
              isOpen={isMenuOpen}
              onClose={onMenuClose}
              activeSection={activeSection}
              onSectionClick={onSectionClick}
              dominantTheme={dominantTheme}
              frameClass={frameClass}
            />
        )}
        <div className="h-screen w-full -mt-14 lg:-mt-22">{children}</div>
      </div>
    </div>
  );
};