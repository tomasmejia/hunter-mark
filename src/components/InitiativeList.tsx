import { useState } from "react";
import type { Combatant } from "../types";

type InitiativeListProps = {
  combatants: Combatant[];
  activeCombatantId: string | null;
  onUpdateHp: (combatantId: string, delta: number) => void;
  onSetCurrentHp: (combatantId: string, nextHp: number) => void;
  onSetMaxHp: (combatantId: string, nextHp: number) => void;
  onDuplicateCombatant: (combatantId: string) => void;
  onDeleteCombatant: (combatantId: string) => void;
};

export default function InitiativeList({
  combatants,
  activeCombatantId,
  onUpdateHp,
  onSetCurrentHp,
  onSetMaxHp,
  onDuplicateCombatant,
  onDeleteCombatant,
}: InitiativeListProps) {
  const [editing, setEditing] = useState<{ combatantId: string; field: "current" | "max" } | null>(null);
  const [draftHp, setDraftHp] = useState("");

  const startEditing = (combatant: Combatant, field: "current" | "max") => {
    setEditing({ combatantId: combatant.id, field });
    setDraftHp(String(field === "current" ? combatant.currentHp : combatant.maxHp));
  };

  const stopEditing = () => {
    setEditing(null);
    setDraftHp("");
  };

  const saveEditedHp = (combatant: Combatant) => {
    const parsed = Number(draftHp);
    if (!Number.isFinite(parsed)) {
      stopEditing();
      return;
    }
    if (editing?.field === "max") {
      onSetMaxHp(combatant.id, parsed);
    } else {
      onSetCurrentHp(combatant.id, parsed);
    }
    stopEditing();
  };

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <h2 className="mb-3 text-lg font-semibold">Initiative Order</h2>
      <div className="space-y-2">
        {combatants.length === 0 ? (
          <p className="text-sm text-slate-400">No combatants yet.</p>
        ) : (
          combatants.map((combatant) => (
            <article
              key={combatant.id}
              className={`grid gap-2 rounded-md border p-3 md:grid-cols-12 ${
                combatant.id === activeCombatantId
                  ? "border-emerald-500 bg-emerald-950/40"
                  : "border-slate-700 bg-slate-950/40"
              }`}
            >
              <div className="md:col-span-4">
                <p className="font-semibold">{combatant.name}</p>
                <p className="text-xs uppercase text-slate-400">
                  {combatant.type} | AC {combatant.ac} | Init {combatant.initiative}
                </p>
              </div>
              <div className="md:col-span-5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateHp(combatant.id, -5)}
                  className="rounded bg-rose-700 px-2 py-1 text-sm hover:bg-rose-600"
                >
                  -5
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateHp(combatant.id, -1)}
                  className="rounded bg-rose-700 px-2 py-1 text-sm hover:bg-rose-600"
                >
                  -1
                </button>
                <div className="flex items-center gap-1 text-sm">
                  <span>HP</span>
                  {editing?.combatantId === combatant.id && editing.field === "current" ? (
                    <input
                      type="number"
                      min={0}
                      max={combatant.maxHp}
                      value={draftHp}
                      autoFocus
                      className="h-8 w-16 rounded border border-slate-700 bg-slate-950 px-1 text-center text-sm"
                      onChange={(event) => setDraftHp(event.target.value)}
                      onBlur={stopEditing}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          saveEditedHp(combatant);
                        }
                        if (event.key === "Escape") {
                          stopEditing();
                        }
                      }}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEditing(combatant, "current")}
                      className="rounded px-1 text-sm text-slate-100 underline decoration-dotted underline-offset-2 hover:text-slate-300"
                    >
                      {combatant.currentHp}
                    </button>
                  )}
                  <span>/</span>
                  {editing?.combatantId === combatant.id && editing.field === "max" ? (
                    <input
                      type="number"
                      min={1}
                      value={draftHp}
                      autoFocus
                      className="h-8 w-16 rounded border border-slate-700 bg-slate-950 px-1 text-center text-sm"
                      onChange={(event) => setDraftHp(event.target.value)}
                      onBlur={stopEditing}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          saveEditedHp(combatant);
                        }
                        if (event.key === "Escape") {
                          stopEditing();
                        }
                      }}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEditing(combatant, "max")}
                      className="rounded px-1 text-sm text-slate-100 underline decoration-dotted underline-offset-2 hover:text-slate-300"
                    >
                      {combatant.maxHp}
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateHp(combatant.id, +1)}
                  className="rounded bg-sky-700 px-2 py-1 text-sm hover:bg-sky-600"
                >
                  +1
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateHp(combatant.id, +5)}
                  className="rounded bg-sky-700 px-2 py-1 text-sm hover:bg-sky-600"
                >
                  +5
                </button>
              </div>
              <div className="md:col-span-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => onDuplicateCombatant(combatant.id)}
                  className="rounded bg-slate-700 px-3 py-2 text-sm hover:bg-slate-600"
                >
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteCombatant(combatant.id)}
                  className="rounded bg-rose-700 px-3 py-2 text-sm hover:bg-rose-600"
                >
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
