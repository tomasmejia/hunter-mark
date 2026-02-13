export type CombatantType = "player" | "npc" | "monster";

export type ActionKind = "attack" | "spell" | "ability";

export type CombatAction = {
  id: string;
  name: string;
  kind: ActionKind;
  toHit?: number;
  saveDc?: number;
  damage?: string;
  notes?: string;
};

export type Combatant = {
  id: string;
  name: string;
  type: CombatantType;
  maxHp: number;
  currentHp: number;
  ac: number;
  initiative: number;
  conditions: string[];
  actions: CombatAction[];
  createdAt: string;
  updatedAt: string;
};

export type Encounter = {
  id: string;
  name: string;
  round: number;
  combatants: Combatant[];
  activeCombatantId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NewCombatantInput = {
  name: string;
  type: CombatantType;
  maxHp: number;
  currentHp: number;
  ac: number;
  initiative: number;
};
