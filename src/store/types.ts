import type { StoreApi } from "zustand";
import type { Combatant, Encounter, NewCombatantInput } from "../types";

export type AddCombatantOptions = {
  saveToLibrary?: boolean;
};

export type AppStoreState = {
  loading: boolean;
  libraryCombatants: Combatant[];
  encounters: Encounter[];
  activeEncounter: Encounter;
};

export type AppStoreActions = {
  init: () => Promise<void>;
  createEncounter: () => void;
  addCombatant: (input: NewCombatantInput, options?: AddCombatantOptions) => Promise<void>;
  addCombatantFromLibrary: (combatantId: string) => Promise<void>;
  duplicateCombatant: (combatantId: string, count?: number) => Promise<void>;
  deleteCombatant: (combatantId: string) => Promise<void>;
  updateHp: (combatantId: string, delta: number) => Promise<void>;
  setCurrentHp: (combatantId: string, nextHp: number) => Promise<void>;
  setMaxHp: (combatantId: string, nextHp: number) => Promise<void>;
  setAc: (combatantId: string, nextAc: number) => Promise<void>;
  previousTurn: () => Promise<void>;
  nextTurn: () => Promise<void>;
  saveActiveEncounter: (name?: string) => Promise<void>;
  loadEncounter: (encounterId: string) => void;
  deleteEncounter: (encounterId: string) => Promise<void>;
  deleteLibraryCombatant: (combatantId: string) => Promise<void>;
};

export type AppStore = AppStoreState & AppStoreActions;

export type StoreSet = StoreApi<AppStore>["setState"];
export type StoreGet = StoreApi<AppStore>["getState"];
