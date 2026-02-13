import { db } from "../../db";
import type { AppStore, StoreSet } from "../types";

export const createLibraryActions = (set: StoreSet): Pick<AppStore, "deleteLibraryCombatant"> => ({
  deleteLibraryCombatant: async (combatantId) => {
    await db.combatants.delete(combatantId);
    const libraryCombatants = await db.combatants.orderBy("name").toArray();
    set({ libraryCombatants });
  },
});
