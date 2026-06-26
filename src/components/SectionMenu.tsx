import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { isDarkTheme, type Theme } from "../context/ThemeContext";
import type { SectionId } from "../sections/Nav";
import { useSectionInteraction } from "../context/SectionInteractionContext";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  activeSection?: SectionId;
  onSectionClick: (sectionId: SectionId) => void;
  dominantTheme: Theme;
  frameClass: string;
};

const SECTIONS: Array<{ id: SectionId; label: string; theme: string; index: number }> = [
  { id: "hero", label: "HERO", theme:"holographic", index: 0 },
  { id: "about", label: "ABOUT", theme:"retro80", index: 1 },
  { id: "work", label: "WORK", theme:"cybernoir", index: 2 },
  { id: "process", label: "PROCESS", theme:"dreamscape", index: 3 },
  { id: "contact", label: "CONTACT", theme:"wireframe", index: 4 },
];

export const SectionMenu = ({
  isOpen,
  onClose,
  activeSection,
  onSectionClick,
  dominantTheme,
  frameClass,
}: Props) => {
  const darkTheme = isDarkTheme(dominantTheme);

  // Text color classes based on theme
  const textClass = darkTheme ? "text-white" : "text-stone-900";
  const bgClass = darkTheme ? "bg-black/60" : "bg-white/80";
  const hoverClass = darkTheme
    ? "bg-primary"
    : "bg-stone-900/10";
  const activeClass = darkTheme
    ? "bg-white/20 text-white"
    : "bg-stone-900/20 text-stone-900";
  const subtleClass = darkTheme ? "text-white/60" : "text-stone-700/70";
  const svgFillClass = darkTheme ? "fill-white" : "fill-stone-900";

  const {hoveredItemId, setHoveredItemId} = useSectionInteraction("nav");

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHoveredItemId( Math.min((hoveredItemId as number) + 1, SECTIONS.length - 1) );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHoveredItemId(Math.max((hoveredItemId as number) - 1, 0));
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          handleSectionClick(SECTIONS[hoveredItemId as number].id);
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, hoveredItemId, onClose]);

  // Update highlighted index when activeSection changes (via scroll)
  useEffect(() => {
    if (isOpen && activeSection) {
      const index = SECTIONS.findIndex((s) => s.id === activeSection);
      if (index !== -1) {
        setHoveredItemId(index);
      }
    }
  }, [isOpen, activeSection]);

  const handleSectionClick = (sectionId: SectionId) => {
    onSectionClick(sectionId);
    // Menu will close after scroll completes (handled by parent)
  };

  return (
    <motion.div
      initial={{ x: "-100%" }}
      animate={{
        x: isOpen ? 0 : "-100%",
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`absolute inset-y-0 left-0 w-full md:w-1/2  z-40 ${bgClass} ${frameClass} border-r backdrop-blur-sm overflow-hidden pointer-events-auto`}
    >
      {/* Menu Header */}
      <div className={`px-4 py-3 mt-6 border-b ${frameClass} ${subtleClass}`}>
        <div className="text-xs font-mono uppercase tracking-widest">
          SECTION MENU
        </div>
      </div>

      {/* Menu List */}
      <nav className="flex flex-col justify-start overflow-y-auto">
        {SECTIONS.map((section, index) => {
          const isHighlighted = index === hoveredItemId;
          const isActive = section.id === activeSection;

          return (
            <button
              key={section.id}
              data-theme={section.theme}
              onClick={() => handleSectionClick(section.id)}
              onMouseEnter={() => setHoveredItemId(section.index)}
              className={`flex-1 px-4 py-3 text-left border-b ${frameClass} transition-all duration-150 
                ${ isActive ? activeClass : textClass } 
                ${isHighlighted && !isActive ? hoverClass : ""} 
                focus:outline-none focus:ring-1 focus:ring-offset-0 
                ${ darkTheme ? "focus:ring-white/50" : "focus:ring-stone-900/50" }`}
              aria-label={`Navigate to ${section.label} section`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-xs font-mono ${subtleClass}`}>
                  {String(section.index).padStart(2, "0")}
                </span>
                <span
                  className={`text-sm font-mono font-semibold ${
                    isActive ? "font-bold" : ""
                  }`}
                >
                  {section.label}
                </span>
                {isActive && (
                  <span className={`ml-auto text-xs ${subtleClass}`}>●</span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Contact */}
      <div
        className={`px-4 py-2 mt-10  ${frameClass} text-xs ${subtleClass} font-mono uppercase tracking-widest pointer-events-none`}
      >
        Contacts
      </div>
      <div className={`px-4 py-2 mt-2 text-sm font-mono font-semibold ${textClass}`}>
        <svg className={`h-6 w-6 inline-block mr-2 ${svgFillClass}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M125.4 128C91.5 128 64 155.5 64 189.4C64 190.3 64 191.1 64.1 192L64 192L64 448C64 483.3 92.7 512 128 512L512 512C547.3 512 576 483.3 576 448L576 192L575.9 192C575.9 191.1 576 190.3 576 189.4C576 155.5 548.5 128 514.6 128L125.4 128zM528 256.3L528 448C528 456.8 520.8 464 512 464L128 464C119.2 464 112 456.8 112 448L112 256.3L266.8 373.7C298.2 397.6 341.7 397.6 373.2 373.7L528 256.3zM112 189.4C112 182 118 176 125.4 176L514.6 176C522 176 528 182 528 189.4C528 193.6 526 197.6 522.7 200.1L344.2 335.5C329.9 346.3 310.1 346.3 295.8 335.5L117.3 200.1C114 197.6 112 193.6 112 189.4z"/></svg>
        <a href="mailto:jean-baptiste.guy2358@gmail.com" className="hover:underline">jean-baptiste.guy2358@gmail.com</a>
      </div>
      <div className={`px-4 py-2 mt-2 text-sm font-mono font-semibold ${textClass}`}>
        <svg className={`h-6 w-6 inline-block mr-2 ${svgFillClass}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M224.2 89C216.3 70.1 195.7 60.1 176.1 65.4L170.6 66.9C106 84.5 50.8 147.1 66.9 223.3C104 398.3 241.7 536 416.7 573.1C493 589.3 555.5 534 573.1 469.4L574.6 463.9C580 444.2 569.9 423.6 551.1 415.8L453.8 375.3C437.3 368.4 418.2 373.2 406.8 387.1L368.2 434.3C297.9 399.4 241.3 341 208.8 269.3L253 233.3C266.9 222 271.6 202.9 264.8 186.3L224.2 89z"/></svg>
        <a href="tel:+33756836747" className="hover:underline">+33 756 836 747</a>
      </div>

    </motion.div>
  );
};
