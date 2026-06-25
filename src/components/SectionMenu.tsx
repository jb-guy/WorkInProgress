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
      <div className={`px-4 py-3 border-b ${frameClass} ${subtleClass}`}>
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

      {/* Close hint */}
      <div
        className={`px-4 py-2 border-t ${frameClass} text-xs ${subtleClass} font-mono text-center`}
      >
        ESC to close
      </div>
    </motion.div>
  );
};
