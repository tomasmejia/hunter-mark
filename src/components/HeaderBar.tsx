import type { ChangeEvent } from "react";
import type { CombatantType } from "../types";

type HeaderBarProps = {
  round: number;
  activeLabel: string;
  activeType: CombatantType | null;
  encounterName: string;
  onEncounterNameChange: (value: string) => void;
  onPreviousTurn: () => void;
  isPreviousTurnDisabled: boolean;
  onNextTurn: () => void;
  onCreateEncounter: () => void;
  onSaveEncounter: () => void;
};

export default function HeaderBar({
  round,
  activeLabel,
  activeType,
  encounterName,
  onEncounterNameChange,
  onPreviousTurn,
  isPreviousTurnDisabled,
  onNextTurn,
  onCreateEncounter,
  onSaveEncounter,
}: HeaderBarProps) {
  const handleEncounterNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    onEncounterNameChange(event.target.value);
  };
  const activePillClass =
    activeType === "monster"
      ? "bg-rose-900/70 text-rose-200"
      : activeType === "npc"
        ? "bg-amber-900/70 text-amber-200"
        : activeType === "player"
          ? "bg-emerald-900/70 text-emerald-200"
          : "bg-slate-800 text-slate-200";

  return (
    <header className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">Hunter Mark</h1>
        <span className="text-xs rounded-full bg-slate-800 px-2 py-1">Round {round}</span>
        <span className={`text-xs rounded-full px-2 py-1 ${activePillClass}`}>Active: {activeLabel}</span>
        <button
          type="button"
          onClick={onPreviousTurn}
          disabled={isPreviousTurnDisabled}
          className="ml-auto rounded-md bg-slate-700 px-3 py-2 text-sm font-semibold hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-slate-700"
        >
          Previous Turn
        </button>
        <button
          type="button"
          onClick={onNextTurn}
          className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold hover:bg-emerald-500"
        >
          Next Turn
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onCreateEncounter}
          className="rounded-md bg-slate-700 px-3 py-2 text-sm hover:bg-slate-600"
        >
          New Encounter
        </button>
        <button
          type="button"
          onClick={onSaveEncounter}
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm hover:bg-indigo-500"
        >
          Save Encounter
        </button>
        <input
          value={encounterName}
          onChange={handleEncounterNameChange}
          className="rounded-md border border-slate-700 bg-slate-950 px-2 py-2 text-sm"
          placeholder="Encounter name"
        />
      </div>
    </header>
  );
}
