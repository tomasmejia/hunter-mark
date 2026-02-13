export const DB_NAME = "hunter-mark";

export const SCHEMAS = {
  v1: {
    combatants: "id,type,name,updatedAt",
    encounters: "id,name,updatedAt",
  },
} as const;
