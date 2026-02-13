import { create } from "zustand";
import { createCombatantActions } from "./actions/combatants";
import { createEncounterActions } from "./actions/encounters";
import { createLibraryActions } from "./actions/library";
import type { AppStore } from "./types";
import { blankEncounter } from "./utils";

export const useAppStore = create<AppStore>((set, get) => ({
  loading: false,
  libraryCombatants: [],
  encounters: [],
  activeEncounter: blankEncounter(),
  ...createEncounterActions(set, get),
  ...createCombatantActions(set, get),
  ...createLibraryActions(set),
}));
