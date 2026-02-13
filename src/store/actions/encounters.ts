import { db } from "../../db";
import type { Encounter } from "../../types";
import type { AppStore, StoreGet, StoreSet } from "../types";
import {
  blankEncounter,
  normalizeEncounter,
  nowIso,
  persistEncounter,
  readDraftEncounter,
  sortByInitiativeDesc,
} from "../utils";

export const createEncounterActions = (
  set: StoreSet,
  get: StoreGet
): Pick<
  AppStore,
  "init" | "createEncounter" | "nextTurn" | "saveActiveEncounter" | "loadEncounter" | "deleteEncounter"
> => ({
  init: async () => {
    set({ loading: true });
    const [libraryCombatants, encounters] = await Promise.all([
      db.combatants.orderBy("name").toArray(),
      db.encounters.orderBy("updatedAt").reverse().toArray(),
    ]);
    const draftEncounter = readDraftEncounter();
    const normalizedEncounters = encounters.map(normalizeEncounter);
    const normalizedDraft = draftEncounter ? normalizeEncounter(draftEncounter) : null;

    set((state) => ({
      loading: false,
      libraryCombatants,
      encounters: normalizedEncounters,
      activeEncounter: normalizedDraft ?? normalizedEncounters[0] ?? state.activeEncounter,
    }));
  },

  createEncounter: () => {
    set({ activeEncounter: blankEncounter() });
  },

  nextTurn: async () => {
    const current = get().activeEncounter;
    const ordered = sortByInitiativeDesc(current.combatants);
    if (ordered.length === 0) {
      return;
    }

    const activeId = current.activeCombatantId ?? ordered[0].id;
    const currentIndex = ordered.findIndex((c) => c.id === activeId);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % ordered.length;
    const wrapped = currentIndex !== -1 && nextIndex === 0;
    const nextRound = wrapped ? current.round + 1 : current.round;

    const nextEncounter: Encounter = {
      ...current,
      round: nextRound,
      activeCombatantId: ordered[nextIndex].id,
      updatedAt: nowIso(),
    };

    set({ activeEncounter: nextEncounter });
    await persistEncounter(nextEncounter);
  },

  saveActiveEncounter: async (name) => {
    const current = get().activeEncounter;
    const next: Encounter = {
      ...current,
      name: name?.trim() || current.name || "Encounter",
      updatedAt: nowIso(),
    };
    await persistEncounter(next);

    const encounters = await db.encounters.orderBy("updatedAt").reverse().toArray();
    set({ activeEncounter: next, encounters });
  },

  loadEncounter: (encounterId) => {
    const encounter = get().encounters.find((item) => item.id === encounterId);
    if (!encounter) {
      return;
    }
    set({ activeEncounter: normalizeEncounter(encounter) });
  },

  deleteEncounter: async (encounterId) => {
    await db.encounters.delete(encounterId);
    const encounters = await db.encounters.orderBy("updatedAt").reverse().toArray();
    set((state) => ({
      encounters,
      activeEncounter:
        state.activeEncounter.id === encounterId ? encounters[0] ?? blankEncounter() : state.activeEncounter,
    }));
  },
});
