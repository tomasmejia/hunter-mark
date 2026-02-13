import { db } from "../../db";
import type { Combatant, Encounter } from "../../types";
import type { AppStore, StoreGet, StoreSet } from "../types";
import { makeId, nowIso, persistEncounter, sortByInitiativeDesc } from "../utils";

export const createCombatantActions = (
  set: StoreSet,
  get: StoreGet
): Pick<
  AppStore,
  "addCombatant" | "addCombatantFromLibrary" | "duplicateCombatant" | "deleteCombatant" | "updateHp"
> => ({
  addCombatant: async (input, options) => {
    const current = get().activeEncounter;
    const timestamp = nowIso();
    const combatant: Combatant = {
      id: makeId(),
      name: input.name.trim(),
      type: input.type,
      maxHp: input.maxHp,
      currentHp: input.currentHp,
      ac: input.ac,
      initiative: input.initiative,
      conditions: [],
      actions: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const nextEncounter: Encounter = {
      ...current,
      combatants: [...current.combatants, combatant],
      activeCombatantId: current.activeCombatantId ?? combatant.id,
      updatedAt: timestamp,
    };

    set({ activeEncounter: nextEncounter });
    await persistEncounter(nextEncounter);

    if (options?.saveToLibrary) {
      await db.combatants.put(combatant);
      const libraryCombatants = await db.combatants.orderBy("name").toArray();
      set({ libraryCombatants });
    }
  },

  addCombatantFromLibrary: async (combatantId) => {
    const template = get().libraryCombatants.find((item) => item.id === combatantId);
    if (!template) {
      return;
    }

    const timestamp = nowIso();
    const copiedCombatant: Combatant = {
      ...template,
      id: makeId(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const current = get().activeEncounter;
    const nextEncounter: Encounter = {
      ...current,
      combatants: [...current.combatants, copiedCombatant],
      activeCombatantId: current.activeCombatantId ?? copiedCombatant.id,
      updatedAt: timestamp,
    };

    set({ activeEncounter: nextEncounter });
    await persistEncounter(nextEncounter);
  },

  duplicateCombatant: async (combatantId, count = 1) => {
    const current = get().activeEncounter;
    const source = current.combatants.find((combatant) => combatant.id === combatantId);
    if (!source) {
      return;
    }

    const copies = Array.from({ length: count }, (_, index) => {
      const timestamp = nowIso();
      return {
        ...source,
        id: makeId(),
        name: `${source.name} ${index + 2}`,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
    });

    const nextEncounter: Encounter = {
      ...current,
      combatants: [...current.combatants, ...copies],
      updatedAt: nowIso(),
    };

    set({ activeEncounter: nextEncounter });
    await persistEncounter(nextEncounter);
  },

  deleteCombatant: async (combatantId) => {
    const current = get().activeEncounter;
    const nextCombatants = current.combatants.filter((combatant) => combatant.id !== combatantId);
    const ordered = sortByInitiativeDesc(nextCombatants);
    const nextActiveId =
      current.activeCombatantId === combatantId ? (ordered[0]?.id ?? null) : current.activeCombatantId;

    const nextEncounter: Encounter = {
      ...current,
      round: nextCombatants.length === 0 ? 1 : current.round,
      combatants: nextCombatants,
      activeCombatantId: nextActiveId,
      updatedAt: nowIso(),
    };

    set({ activeEncounter: nextEncounter });
    await persistEncounter(nextEncounter);
  },

  updateHp: async (combatantId, delta) => {
    const current = get().activeEncounter;
    const nextCombatants = current.combatants.map((combatant) => {
      if (combatant.id !== combatantId) {
        return combatant;
      }
      const nextHp = Math.max(0, Math.min(combatant.maxHp, combatant.currentHp + delta));
      return {
        ...combatant,
        currentHp: nextHp,
        updatedAt: nowIso(),
      };
    });

    const nextEncounter: Encounter = {
      ...current,
      combatants: nextCombatants,
      updatedAt: nowIso(),
    };
    set({ activeEncounter: nextEncounter });
    await persistEncounter(nextEncounter);
  },
});
