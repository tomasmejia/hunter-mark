import { db } from "../db";
import type { Combatant, Encounter } from "../types";

export const nowIso = () => new Date().toISOString();

export const makeId = () => {
  if ("randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const blankEncounter = (): Encounter => {
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

export const sortByInitiativeDesc = (combatants: Combatant[]) =>
  [...combatants].sort((a, b) => b.initiative - a.initiative);

export const persistEncounter = async (encounter: Encounter) => {
  await db.encounters.put(encounter);
};

export const normalizeEncounter = (encounter: Encounter): Encounter => ({
  ...encounter,
  round:
    typeof (encounter as { round?: number }).round === "number" &&
    Number.isFinite((encounter as { round?: number }).round)
      ? Math.max(1, Math.floor((encounter as { round?: number }).round as number))
      : 1,
});

export const readDraftEncounter = (): Encounter | null => {
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
