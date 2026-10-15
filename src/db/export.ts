import { db } from ".";

/** Downloads the whole database as JSON, in the shape d20.tools imports. */
export async function exportJson() {
  const [combatants, encounters] = await Promise.all([db.combatants.toArray(), db.encounters.toArray()]);
  const file = { format: "hunter-mark", version: 1, exportedAt: new Date().toISOString(), combatants, encounters };
  const url = URL.createObjectURL(new Blob([JSON.stringify(file, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `hunter-mark-${file.exportedAt.slice(0, 10)}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url));
}
