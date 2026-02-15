import type { Encounter } from "../types";

type SavedEncountersProps = {
  encounters: Encounter[];
  onLoadEncounter: (encounterId: string) => void;
  onDeleteEncounter: (encounterId: string) => void;
};

export default function SavedEncounters({
  encounters,
  onLoadEncounter,
  onDeleteEncounter,
}: SavedEncountersProps) {
  return (
    <section className="rounded-xl border border-amber-900/50 bg-[#241a14]/95 p-4 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
      <h2 className="mb-3 text-lg font-semibold text-amber-100">Saved Encounters</h2>
      <div className="flex flex-wrap gap-2">
        {encounters.length === 0 ? (
          <p className="text-sm text-amber-200/70">No saved encounters yet.</p>
        ) : (
          encounters.map((encounter) => (
            <div key={encounter.id} className="group relative">
              <button
                type="button"
                onClick={() => onLoadEncounter(encounter.id)}
                className="rounded-md border border-amber-900/35 bg-[#1b130f] px-3 py-2 pr-8 text-sm text-amber-100 hover:border-amber-700/60"
              >
                {encounter.name} ({encounter.combatants.length})
              </button>
              <button
                type="button"
                aria-label={`Delete ${encounter.name}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onDeleteEncounter(encounter.id);
                }}
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded px-1.5 py-0.5 text-xs text-amber-200/65 opacity-0 transition group-hover:opacity-100 hover:bg-red-900/50 hover:text-red-100"
              >
                x
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
