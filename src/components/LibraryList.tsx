import type { Combatant } from "../types";

type LibraryListProps = {
  libraryCombatants: Combatant[];
  onAddFromLibrary: (combatantId: string) => void;
  onDeleteFromLibrary: (combatantId: string) => void;
};

export default function LibraryList({
  libraryCombatants,
  onAddFromLibrary,
  onDeleteFromLibrary,
}: LibraryListProps) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <h2 className="mb-3 text-lg font-semibold">Library</h2>
      {libraryCombatants.length === 0 ? (
        <p className="text-sm text-slate-400">
          No saved combatants yet. Check "Save to library" when adding one.
        </p>
      ) : (
        <div className="space-y-2">
          {libraryCombatants.map((combatant) => (
            <article
              key={combatant.id}
              className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{combatant.name}</p>
                <p className="text-xs uppercase text-slate-400">
                  {combatant.type} | HP {combatant.currentHp}/{combatant.maxHp} | AC {combatant.ac} | Init
                  {combatant.initiative}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onAddFromLibrary(combatant.id)}
                className="rounded bg-emerald-700 px-3 py-1.5 text-xs font-semibold hover:bg-emerald-600"
              >
                Add
              </button>
              <button
                type="button"
                aria-label={`Delete ${combatant.name}`}
                onClick={() => onDeleteFromLibrary(combatant.id)}
                className="rounded px-2 py-1 text-xs text-slate-400 hover:bg-rose-800 hover:text-rose-100"
              >
                x
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
