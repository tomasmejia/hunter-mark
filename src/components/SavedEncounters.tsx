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
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <h2 className="mb-3 text-lg font-semibold">Saved Encounters</h2>
      <div className="flex flex-wrap gap-2">
        {encounters.length === 0 ? (
          <p className="text-sm text-slate-400">No saved encounters yet.</p>
        ) : (
          encounters.map((encounter) => (
            <div key={encounter.id} className="group relative">
              <button
                type="button"
                onClick={() => onLoadEncounter(encounter.id)}
                className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 pr-8 text-sm hover:border-slate-500"
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
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded px-1.5 py-0.5 text-xs text-slate-400 opacity-0 transition group-hover:opacity-100 hover:bg-rose-800 hover:text-rose-100"
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
