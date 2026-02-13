import { useState } from "react";
import type { Combatant } from "../types";

type InitiativeListProps = {
  combatants: Combatant[];
  activeCombatantId: string | null;
  onSetCurrentHp: (combatantId: string, nextHp: number) => void;
  onSetMaxHp: (combatantId: string, nextHp: number) => void;
  onSetAc: (combatantId: string, nextAc: number) => void;
  onSetStatBlockUrl: (combatantId: string, url?: string) => void;
  onDuplicateCombatant: (combatantId: string) => void;
  onDeleteCombatant: (combatantId: string) => void;
};

export default function InitiativeList({
  combatants,
  activeCombatantId,
  onSetCurrentHp,
  onSetMaxHp,
  onSetAc,
  onSetStatBlockUrl,
  onDuplicateCombatant,
  onDeleteCombatant,
}: InitiativeListProps) {
  const [editing, setEditing] = useState<{ combatantId: string; field: "current" | "max" | "ac" | "url" } | null>(
    null
  );
  const [draftValue, setDraftValue] = useState("");

  const startEditing = (combatant: Combatant, field: "current" | "max" | "ac" | "url") => {
    setEditing({ combatantId: combatant.id, field });
    if (field === "current") {
      setDraftValue(String(combatant.currentHp));
      return;
    }
    if (field === "max") {
      setDraftValue(String(combatant.maxHp));
      return;
    }
    if (field === "ac") {
      setDraftValue(String(combatant.ac));
      return;
    }
    setDraftValue(combatant.statBlockUrl ?? "");
  };

  const stopEditing = () => {
    setEditing(null);
    setDraftValue("");
  };

  const saveEditedField = (combatant: Combatant) => {
    if (editing?.field === "url") {
      const trimmed = draftValue.trim();
      if (!trimmed) {
        onSetStatBlockUrl(combatant.id, undefined);
        stopEditing();
        return;
      }
      const normalized = /^(https?:\/\/)/i.test(trimmed) ? trimmed : `https://${trimmed}`;
      onSetStatBlockUrl(combatant.id, normalized);
      stopEditing();
      return;
    }

    const parsed = Number(draftValue);
    if (!Number.isFinite(parsed)) {
      stopEditing();
      return;
    }

    if (editing?.field === "ac") {
      onSetAc(combatant.id, parsed);
    } else if (editing?.field === "max") {
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
                {combatant.statBlockUrl ? (
                  <a
                    href={combatant.statBlockUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={`font-semibold hover:underline ${
                      combatant.type === "monster"
                        ? "text-rose-300 hover:text-rose-200"
                        : combatant.type === "player"
                          ? "text-emerald-300 hover:text-emerald-200"
                        : "text-amber-300 hover:text-amber-200"
                    }`}
                  >
                    {combatant.name}
                  </a>
                ) : (
                  <p
                    className={`font-semibold ${
                      combatant.type === "player"
                        ? "text-emerald-300"
                        : combatant.type === "npc"
                          ? "text-amber-300"
                          : "text-rose-300"
                    }`}
                  >
                    {combatant.name}
                  </p>
                )}
                <p className="text-xs uppercase text-slate-400">
                  {editing?.combatantId === combatant.id && editing.field === "url" ? (
                    <input
                      type="url"
                      value={draftValue}
                      autoFocus
                      placeholder="https://..."
                      className="h-6 w-36 rounded border border-slate-700 bg-slate-950 px-1 text-xs text-slate-100 normal-case"
                      onChange={(event) => setDraftValue(event.target.value)}
                      onBlur={stopEditing}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          saveEditedField(combatant);
                        }
                        if (event.key === "Escape") {
                          stopEditing();
                        }
                      }}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEditing(combatant, "url")}
                      className="rounded text-xs text-slate-100 underline decoration-dotted underline-offset-2 normal-case hover:text-slate-300"
                    >
                      {combatant.type.toUpperCase()}
                    </button>
                  )}{" "}
                  | AC{" "}
                  {editing?.combatantId === combatant.id && editing.field === "ac" ? (
                    <input
                      type="number"
                      min={0}
                      value={draftValue}
                      autoFocus
                      className="h-6 w-14 rounded border border-slate-700 bg-slate-950 px-1 text-center text-xs text-slate-100 normal-case"
                      onChange={(event) => setDraftValue(event.target.value)}
                      onBlur={stopEditing}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          saveEditedField(combatant);
                        }
                        if (event.key === "Escape") {
                          stopEditing();
                        }
                      }}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEditing(combatant, "ac")}
                      className="rounded px-1 text-xs text-slate-100 underline decoration-dotted underline-offset-2 normal-case hover:text-slate-300"
                    >
                      {combatant.ac}
                    </button>
                  )}{" "}
                  | Init {combatant.initiative}
                </p>
              </div>
              <div className="md:col-span-5 flex items-center gap-2">
                <div className="flex items-center gap-1 text-sm">
                  <span>HP</span>
                  {editing?.combatantId === combatant.id && editing.field === "current" ? (
                    <input
                      type="number"
                      min={0}
                      max={combatant.maxHp}
                      value={draftValue}
                      autoFocus
                      className="h-8 w-16 rounded border border-slate-700 bg-slate-950 px-1 text-center text-sm"
                      onChange={(event) => setDraftValue(event.target.value)}
                      onBlur={stopEditing}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          saveEditedField(combatant);
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
                      value={draftValue}
                      autoFocus
                      className="h-8 w-16 rounded border border-slate-700 bg-slate-950 px-1 text-center text-sm"
                      onChange={(event) => setDraftValue(event.target.value)}
                      onBlur={stopEditing}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          saveEditedField(combatant);
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
