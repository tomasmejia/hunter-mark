import { create } from "zustand";
import { db } from "./db";
import type { Combatant, Encounter, NewCombatantInput } from "./types";

type AddCombatantOptions = {
  saveToLibrary?: boolean;
};

type AppStore = {
  loading: boolean;
  libraryCombatants: Combatant[];
  encounters: Encounter[];
  activeEncounter: Encounter;
  init: () => Promise<void>;
  createEncounter: () => void;
  addCombatant: (input: NewCombatantInput, options?: AddCombatantOptions) => Promise<void>;
  addCombatantFromLibrary: (combatantId: string) => Promise<void>;
  duplicateCombatant: (combatantId: string, count?: number) => Promise<void>;
  deleteCombatant: (combatantId: string) => Promise<void>;
  updateHp: (combatantId: string, delta: number) => Promise<void>;
  nextTurn: () => Promise<void>;
  saveActiveEncounter: (name?: string) => Promise<void>;
  loadEncounter: (encounterId: string) => void;
  deleteEncounter: (encounterId: string) => Promise<void>;
  deleteLibraryCombatant: (combatantId: string) => Promise<void>;
};

const nowIso = () => new Date().toISOString();

const makeId = () => {
  if ("randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const blankEncounter = (): Encounter => {
  const now = nowIso();
  return {
    id: makeId(),
    name: "Encounter",
    round: 1,
    combatants: [],
    activeCombatantId: null,
    createdAt: now,
    updatedAt: now,
  };
};

const sortByInitiativeDesc = (combatants: Combatant[]) =>
  [...combatants].sort((a, b) => b.initiative - a.initiative);

const persistEncounter = async (encounter: Encounter) => {
  await db.encounters.put(encounter);
};

const normalizeEncounter = (encounter: Encounter): Encounter => ({
  ...encounter,
  round:
    typeof (encounter as { round?: number }).round === "number" &&
    Number.isFinite((encounter as { round?: number }).round)
      ? Math.max(1, Math.floor((encounter as { round?: number }).round as number))
      : 1,
});

const readDraftEncounter = (): Encounter | null => {
  try {
    const raw = localStorage.getItem("hm-active-encounter");
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as Encounter;
  } catch {
    return null;
  }
};

export const useAppStore = create<AppStore>((set, get) => ({
  loading: false,
  libraryCombatants: [],
  encounters: [],
  activeEncounter: blankEncounter(),

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
    const source = current.combatants.find((c) => c.id === combatantId);
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
      current.activeCombatantId === combatantId
        ? (ordered[0]?.id ?? null)
        : current.activeCombatantId;

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

    set({
      activeEncounter: nextEncounter,
    });
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
        state.activeEncounter.id === encounterId
          ? encounters[0] ?? blankEncounter()
          : state.activeEncounter,
    }));
  },

  deleteLibraryCombatant: async (combatantId) => {
    await db.combatants.delete(combatantId);
    const libraryCombatants = await db.combatants.orderBy("name").toArray();
    set({ libraryCombatants });
  },

}));
