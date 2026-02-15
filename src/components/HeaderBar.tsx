import type { ChangeEvent } from "react";
import type { CombatantType } from "../types";

type HeaderBarProps = {
  round: number;
  activeLabel: string;
  activeType: CombatantType | null;
  activeIsDown: boolean;
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
  activeIsDown,
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
  const activePillClass = activeIsDown
    ? "bg-stone-700/80 text-stone-100"
    : activeType === "monster"
      ? "bg-red-900/60 text-red-100"
      : activeType === "npc"
        ? "bg-yellow-900/55 text-yellow-100"
        : activeType === "player"
          ? "bg-lime-900/60 text-lime-100"
          : "bg-stone-800 text-stone-100";

  return (
    <header className="space-y-3 rounded-xl border border-amber-900/50 bg-[#241a14]/95 p-4 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-wide text-amber-100">Hunter Mark</h1>
        <span className="rounded-full bg-[#3a2a1f] px-2 py-1 text-xs text-amber-100">Round {round}</span>
        <span className={`text-xs rounded-full px-2 py-1 ${activePillClass}`}>Active: {activeLabel}</span>
        <button
          type="button"
          onClick={onPreviousTurn}
          disabled={isPreviousTurnDisabled}
          className="ml-auto rounded-md bg-[#4a3a2d] px-3 py-2 text-sm font-semibold text-amber-50 hover:bg-[#5a4939] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#4a3a2d]"
        >
          Previous Turn
        </button>
        <button
          type="button"
          onClick={onNextTurn}
          className="rounded-md bg-[#7a4e1d] px-3 py-2 text-sm font-semibold text-amber-50 hover:bg-[#8b5b23]"
        >
          Next Turn
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onCreateEncounter}
          className="rounded-md bg-[#4a3a2d] px-3 py-2 text-sm text-amber-50 hover:bg-[#5a4939]"
        >
          New Encounter
        </button>
        <button
          type="button"
          onClick={onSaveEncounter}
          className="rounded-md bg-[#51633f] px-3 py-2 text-sm text-amber-50 hover:bg-[#5f7449]"
        >
          Save Encounter
        </button>
        <input
          value={encounterName}
          onChange={handleEncounterNameChange}
          className="rounded-md border border-amber-900/40 bg-[#1b130f] px-2 py-2 text-sm text-amber-100 placeholder:text-stone-500"
          placeholder="Encounter name"
        />
      </div>
    </header>
  );
}
