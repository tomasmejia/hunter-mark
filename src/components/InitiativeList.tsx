import { useEffect, useRef, useState } from "react";
import type { Combatant } from "../types";

type InitiativeListProps = {
  combatants: Combatant[];
  activeCombatantId: string | null;
  onUpdateHp: (combatantId: string, delta: number) => void;
  onSetCurrentHp: (combatantId: string, nextHp: number) => void;
  onSetMaxHp: (combatantId: string, nextHp: number) => void;
  onSetAc: (combatantId: string, nextAc: number) => void;
  onSetInitiative: (combatantId: string, nextInitiative: number) => void;
  onSetStatBlockUrl: (combatantId: string, url?: string) => void;
  onSaveCombatantToLibrary: (combatantId: string) => void;
  onDuplicateCombatant: (combatantId: string) => void;
  onDeleteCombatant: (combatantId: string) => void;
};

export default function InitiativeList({
  combatants,
  activeCombatantId,
  onUpdateHp,
  onSetCurrentHp,
  onSetMaxHp,
  onSetAc,
  onSetInitiative,
  onSetStatBlockUrl,
  onSaveCombatantToLibrary,
  onDuplicateCombatant,
  onDeleteCombatant,
}: InitiativeListProps) {
  const [editing, setEditing] = useState<{
    combatantId: string;
    field: "current" | "max" | "ac" | "init" | "url";
  } | null>(null);
  const [draftValue, setDraftValue] = useState("");
  const [hpModifierEditor, setHpModifierEditor] = useState<{ combatantId: string; mode: "add" | "sub" } | null>(
    null
  );
  const [hpModifierValue, setHpModifierValue] = useState("");
  const hpModifierPopoverRef = useRef<HTMLDivElement | null>(null);
  const urlPopoverRef = useRef<HTMLDivElement | null>(null);

  const startEditing = (combatant: Combatant, field: "current" | "max" | "ac" | "init" | "url") => {
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
    if (field === "init") {
      setDraftValue(String(combatant.initiative));
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
    } else if (editing?.field === "init") {
      onSetInitiative(combatant.id, parsed);
    } else if (editing?.field === "max") {
      onSetMaxHp(combatant.id, parsed);
    } else {
      onSetCurrentHp(combatant.id, parsed);
    }
    stopEditing();
  };

  const startHpModifierEditing = (combatant: Combatant, mode: "add" | "sub") => {
    setHpModifierEditor({ combatantId: combatant.id, mode });
    setHpModifierValue("");
  };

  const stopHpModifierEditing = () => {
    setHpModifierEditor(null);
    setHpModifierValue("");
  };

  const applyHpModifier = (combatant: Combatant) => {
    if (!hpModifierEditor || hpModifierEditor.combatantId !== combatant.id) {
      return;
    }

    const parsed = Number(hpModifierValue);
    if (!Number.isFinite(parsed)) {
      stopHpModifierEditing();
      return;
    }

    const magnitude = Math.floor(Math.abs(parsed));
    if (magnitude <= 0) {
      stopHpModifierEditing();
      return;
    }

    const delta = hpModifierEditor.mode === "sub" ? -magnitude : magnitude;
    onUpdateHp(combatant.id, delta);
    stopHpModifierEditing();
  };

  useEffect(() => {
    if (!hpModifierEditor) {
      return;
    }

    const handleMouseDown = (event: MouseEvent) => {
      if (!hpModifierPopoverRef.current) {
        return;
      }
      if (!hpModifierPopoverRef.current.contains(event.target as Node)) {
        stopHpModifierEditing();
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [hpModifierEditor]);

  useEffect(() => {
    if (!editing || editing.field !== "url") {
      return;
    }

    const handleMouseDown = (event: MouseEvent) => {
      if (!urlPopoverRef.current) {
        return;
      }
      if (!urlPopoverRef.current.contains(event.target as Node)) {
        stopEditing();
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [editing]);

  return (
    <section className="rounded-xl border border-amber-900/50 bg-[#241a14]/95 p-4 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
      <h2 className="mb-3 text-lg font-semibold text-amber-100">Initiative Order</h2>
      <div className="space-y-2">
        {combatants.length === 0 ? (
          <p className="text-sm text-amber-200/70">No combatants yet.</p>
        ) : (
          combatants.map((combatant) => (
            <article
              key={combatant.id}
              className={`grid gap-2 rounded-md border p-3 md:grid-cols-12 ${
                combatant.id === activeCombatantId
                  ? combatant.currentHp <= 0
                    ? "border-stone-500 bg-stone-900/35"
                    : combatant.type === "monster"
                    ? "border-red-700 bg-red-950/25"
                    : combatant.type === "npc"
                      ? "border-yellow-700 bg-yellow-950/25"
                      : "border-lime-700 bg-lime-950/25"
                  : "border-amber-900/35 bg-[#1b130f]"
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
                        ? "text-red-200 hover:text-red-100"
                        : combatant.type === "player"
                          ? "text-lime-200 hover:text-lime-100"
                        : "text-yellow-200 hover:text-yellow-100"
                    }`}
                  >
                    {combatant.name}
                    {combatant.currentHp <= 0 ? " 💀" : ""}
                  </a>
                ) : (
                  <p
                    className={`font-semibold ${
                      combatant.type === "player"
                        ? "text-lime-200"
                        : combatant.type === "npc"
                          ? "text-yellow-200"
                          : "text-red-200"
                    }`}
                  >
                    {combatant.name}
                    {combatant.currentHp <= 0 ? " 💀" : ""}
                  </p>
                )}
                <div className="relative">
                  <p className="flex items-center gap-1 text-xs uppercase text-amber-100/65">
                    <span>{combatant.type}</span>
                    <button
                      type="button"
                      aria-label={`Edit ${combatant.name} URL`}
                      onClick={() => startEditing(combatant, "url")}
                      className="rounded p-0.5 text-amber-100/70 hover:bg-[#3a2a1f] hover:text-amber-50"
                    >
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
                        <path d="M3 17.25V21h3.75l11-11-3.75-3.75-11 11zM20.71 7.04a1 1 0 0 0 0-1.41L18.37 3.29a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                      </svg>
                    </button>
                    <span>| AC</span>
                  {editing?.combatantId === combatant.id && editing.field === "ac" ? (
                    <input
                      type="number"
                      min={0}
                      value={draftValue}
                      autoFocus
                      className="h-6 w-14 rounded border border-amber-900/40 bg-[#1b130f] px-1 text-center text-xs text-amber-100 normal-case"
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
                      className="rounded text-xs text-amber-100 underline decoration-dotted underline-offset-2 normal-case hover:text-amber-200"
                    >
                      {combatant.ac}
                    </button>
                  )}
                    <span>| Init</span>
                    {editing?.combatantId === combatant.id && editing.field === "init" ? (
                      <input
                        type="number"
                        value={draftValue}
                        autoFocus
                        className="h-6 w-14 rounded border border-amber-900/40 bg-[#1b130f] px-1 text-center text-xs text-amber-100 normal-case"
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
                        onClick={() => startEditing(combatant, "init")}
                        className="rounded text-xs text-amber-100 underline decoration-dotted underline-offset-2 normal-case hover:text-amber-200"
                      >
                        {combatant.initiative}
                      </button>
                    )}
                  </p>
                  {editing?.combatantId === combatant.id && editing.field === "url" ? (
                    <div
                      ref={urlPopoverRef}
                      className="absolute left-0 top-6 z-20 w-56 rounded-md border border-amber-900/45 bg-[#241a14] p-3 shadow-lg"
                    >
                      <p className="mb-1 text-xs text-amber-200/80 normal-case">Stat block / sheet URL</p>
                      <input
                        type="url"
                        value={draftValue}
                        autoFocus
                        placeholder="https://..."
                        className="h-8 w-full rounded border border-amber-900/40 bg-[#1b130f] px-2 text-xs text-amber-100 normal-case"
                        onChange={(event) => setDraftValue(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            saveEditedField(combatant);
                          }
                          if (event.key === "Escape") {
                            stopEditing();
                          }
                        }}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="md:col-span-5 flex items-center gap-2">
                <div className="relative flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startHpModifierEditing(combatant, "sub")}
                    className="h-8 w-8 rounded bg-red-800 text-sm font-semibold text-red-100 hover:bg-red-700"
                    aria-label={`Subtract HP from ${combatant.name}`}
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => startHpModifierEditing(combatant, "add")}
                    className="h-8 w-8 rounded bg-lime-800 text-sm font-semibold text-lime-100 hover:bg-lime-700"
                    aria-label={`Add HP to ${combatant.name}`}
                  >
                    +
                  </button>
                  {hpModifierEditor?.combatantId === combatant.id ? (
                    <div
                      ref={hpModifierPopoverRef}
                      className="absolute left-0 top-10 z-20 w-40 rounded-md border border-amber-900/45 bg-[#241a14] p-3 shadow-lg"
                    >
                      <p className="mb-1 text-xs text-amber-200/80">
                        {hpModifierEditor.mode === "sub" ? "Damage" : "Healing"}
                      </p>
                      <input
                        type="number"
                        min={1}
                        value={hpModifierValue}
                        autoFocus
                        className="h-8 w-full rounded border border-amber-900/40 bg-[#1b130f] px-2 text-center text-sm text-amber-100"
                        onChange={(event) => setHpModifierValue(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            applyHpModifier(combatant);
                          }
                          if (event.key === "Escape") {
                            stopHpModifierEditing();
                          }
                        }}
                      />
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center gap-1 text-sm text-amber-100">
                  <span>HP</span>
                  {editing?.combatantId === combatant.id && editing.field === "current" ? (
                    <input
                      type="number"
                      min={0}
                      max={combatant.maxHp}
                      value={draftValue}
                      autoFocus
                      className="h-8 w-16 rounded border border-amber-900/40 bg-[#1b130f] px-1 text-center text-sm text-amber-100"
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
                      className="rounded text-sm text-amber-100 underline decoration-dotted underline-offset-2 hover:text-amber-200"
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
                      className="h-8 w-16 rounded border border-amber-900/40 bg-[#1b130f] px-1 text-center text-sm text-amber-100"
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
                      className="rounded text-sm text-amber-100 underline decoration-dotted underline-offset-2 hover:text-amber-200"
                    >
                      {combatant.maxHp}
                    </button>
                  )}
                </div>
              </div>
              <div className="md:col-span-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => onSaveCombatantToLibrary(combatant.id)}
                  className="rounded bg-[#51633f] px-3 py-2 text-sm text-amber-50 hover:bg-[#5f7449]"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => onDuplicateCombatant(combatant.id)}
                  className="rounded bg-[#4a3a2d] px-3 py-2 text-sm text-amber-50 hover:bg-[#5a4939]"
                >
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteCombatant(combatant.id)}
                  className="rounded bg-red-800 px-3 py-2 text-sm text-red-100 hover:bg-red-700"
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
