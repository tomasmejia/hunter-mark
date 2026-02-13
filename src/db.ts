import Dexie, { type Table } from "dexie";
import type { Combatant, Encounter } from "./types";

class HunterMarkDb extends Dexie {
  combatants!: Table<Combatant, string>;
  encounters!: Table<Encounter, string>;

  constructor() {
    super("hunter-mark");
    this.version(1).stores({
      combatants: "id,type,name,updatedAt",
      encounters: "id,name,updatedAt",
    });
  }
}

export const db = new HunterMarkDb();
