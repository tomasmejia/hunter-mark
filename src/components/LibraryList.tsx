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
    <section className="rounded-xl border border-amber-900/50 bg-[#241a14]/95 p-4 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
      <h2 className="mb-3 text-lg font-semibold text-amber-100">Library</h2>
      {libraryCombatants.length === 0 ? (
        <p className="text-sm text-amber-200/70">
          No saved combatants yet. Check "Save to library" when adding one.
        </p>
      ) : (
        <div className="space-y-2">
          {libraryCombatants.map((combatant) => (
            <article
              key={combatant.id}
              className="flex items-center gap-2 rounded-md border border-amber-900/35 bg-[#1b130f] px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-amber-100">{combatant.name}</p>
                <p className="text-xs uppercase text-amber-100/65">
                  {combatant.type} | HP {combatant.currentHp}/{combatant.maxHp} | AC {combatant.ac} | Init{" "}
                  {combatant.initiative}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onAddFromLibrary(combatant.id)}
                className="rounded bg-[#51633f] px-3 py-1.5 text-xs font-semibold text-amber-50 hover:bg-[#5f7449]"
              >
                Add
              </button>
              <button
                type="button"
                aria-label={`Delete ${combatant.name}`}
                onClick={() => onDeleteFromLibrary(combatant.id)}
                className="rounded px-2 py-1 text-xs text-amber-200/60 hover:bg-red-900/50 hover:text-red-100"
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
