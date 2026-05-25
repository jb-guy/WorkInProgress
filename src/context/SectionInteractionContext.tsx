import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { SectionId } from "../sections/Nav";

type ItemId = string | null;

type SectionInteractionState = {
  interaction: string| null; // e.g. "hover", "active", "focus"
  details: any; // optional additional info about the interaction, e.g. { itemId: string }
  hoveredItemId: ItemId;
  activeItemId: ItemId;
  focusedItemId: ItemId;
};

type InteractionStateBySection = Partial<Record<SectionId, SectionInteractionState>>;

type SectionInteractionContextValue = {
  stateBySection: InteractionStateBySection;
  setInteraction: (sectionId: SectionId, interaction: string | null) => void;
  setDetails: (sectionId: SectionId, details: any) => void;
  setHoveredItemId: (sectionId: SectionId, itemId: ItemId) => void;
  setActiveItemId: (sectionId: SectionId, itemId: ItemId) => void;
  setFocusedItemId: (sectionId: SectionId, itemId: ItemId) => void;
};

const EMPTY_SECTION_STATE: SectionInteractionState = {
  interaction: null,
  details: null,
  hoveredItemId: null,
  activeItemId: null,
  focusedItemId: null,
};

const SectionInteractionContext = createContext<SectionInteractionContextValue>({
  stateBySection: {},
  setInteraction: () => {},
  setDetails: () => {},
  setHoveredItemId: () => {},
  setActiveItemId: () => {},
  setFocusedItemId: () => {},
});

const patchSectionState = (
  previous: InteractionStateBySection,
  sectionId: SectionId,
  patch: Partial<SectionInteractionState>,
): InteractionStateBySection => {
  const current = previous[sectionId] ?? EMPTY_SECTION_STATE;
  return {
    ...previous,
    [sectionId]: {
      ...current,
      ...patch,
    },
  };
};

export const SectionInteractionProvider = ({ children }: { children: ReactNode }) => {
  const [stateBySection, setStateBySection] = useState<InteractionStateBySection>({});

  const value = useMemo<SectionInteractionContextValue>(() => ({
    stateBySection,
    setInteraction: (sectionId, interaction) => {
      setStateBySection((previous) => patchSectionState(previous, sectionId, { interaction: interaction }));
    },
    setDetails: (sectionId, details) => {
      setStateBySection((previous) => patchSectionState(previous, sectionId, { details: details }));
    },
    setHoveredItemId: (sectionId, itemId) => {
      setStateBySection((previous) => patchSectionState(previous, sectionId, { hoveredItemId: itemId }));
    },
    setActiveItemId: (sectionId, itemId) => {
      setStateBySection((previous) => patchSectionState(previous, sectionId, { activeItemId: itemId }));
    },
    setFocusedItemId: (sectionId, itemId) => {
      setStateBySection((previous) => patchSectionState(previous, sectionId, { focusedItemId: itemId }));
    },
  }), [stateBySection]);

  return (
    <SectionInteractionContext.Provider value={value}>
      {children}
    </SectionInteractionContext.Provider>
  );
};

export const useSectionInteraction = (sectionId: SectionId) => {
  const context = useContext(SectionInteractionContext);
  const sectionState = context.stateBySection[sectionId] ?? EMPTY_SECTION_STATE;

  return {
    interaction: sectionState.interaction,
    details: sectionState.details,
    hoveredItemId: sectionState.hoveredItemId,
    activeItemId: sectionState.activeItemId,
    focusedItemId: sectionState.focusedItemId,
    setInteraction: (interaction: string | null) => context.setInteraction(sectionId, interaction),
    setDetails: (details: any) => context.setDetails(sectionId, details),
    setHoveredItemId: (itemId: ItemId) => context.setHoveredItemId(sectionId, itemId),
    setActiveItemId: (itemId: ItemId) => context.setActiveItemId(sectionId, itemId),
    setFocusedItemId: (itemId: ItemId) => context.setFocusedItemId(sectionId, itemId),
  };
};
