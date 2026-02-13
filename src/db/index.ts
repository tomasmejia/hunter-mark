import Dexie, { type Table } from "dexie";
import type { Combatant, Encounter } from "../types";
import { DB_NAME, SCHEMAS } from "./schema";

class HunterMarkDb extends Dexie {
  combatants!: Table<Combatant, string>;
  encounters!: Table<Encounter, string>;

  constructor() {
    super(DB_NAME);
    this.version(1).stores(SCHEMAS.v1);
  }
}

export const db = new HunterMarkDb();
