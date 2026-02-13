import type { ChangeEvent, FormEvent, MutableRefObject } from "react";
import type { CombatantType } from "../types";

export type AddCombatantFormState = {
  name: string;
  type: CombatantType;
  maxHp: string;
  currentHp: string;
  ac: string;
  initiative: string;
  saveToLibrary: boolean;
};

type AddCombatantFormProps = {
  form: AddCombatantFormState;
  nameInputRef: MutableRefObject<HTMLInputElement | null>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onChange: (next: AddCombatantFormState) => void;
};

export default function AddCombatantForm({ form, nameInputRef, onSubmit, onChange }: AddCombatantFormProps) {
  const handleField = (key: keyof AddCombatantFormState) => (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...form, [key]: event.target.value });
  };

  const handleTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...form, type: event.target.value as CombatantType });
  };

  const handleSaveToLibraryChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...form, saveToLibrary: event.target.checked });
  };

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <h2 className="mb-3 text-lg font-semibold">Add Combatant</h2>
      <form onSubmit={onSubmit} className="grid gap-2 md:grid-cols-7">
        <label className="md:col-span-2">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-300">Name</span>
          <input
            ref={nameInputRef}
            value={form.name}
            onChange={handleField("name")}
            placeholder="Goblin x4"
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-2"
          />
        </label>
        <label>
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-300">Type</span>
          <select
            value={form.type}
            onChange={handleTypeChange}
            className="h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-2"
          >
            <option value="player">Player</option>
            <option value="npc">NPC</option>
            <option value="monster">Monster</option>
          </select>
        </label>
        <label>
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-300">Max HP</span>
          <input
            value={form.maxHp}
            onChange={handleField("maxHp")}
            inputMode="numeric"
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-2"
          />
        </label>
        <label>
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-300">Current HP</span>
          <input
            value={form.currentHp}
            onChange={handleField("currentHp")}
            inputMode="numeric"
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-2"
          />
        </label>
        <label>
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-300">AC</span>
          <input
            value={form.ac}
            onChange={handleField("ac")}
            inputMode="numeric"
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-2"
          />
        </label>
        <label>
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-300">Initiative</span>
          <input
            value={form.initiative}
            onChange={handleField("initiative")}
            inputMode="numeric"
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-2"
          />
        </label>
        <label className="md:col-span-3 inline-flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={form.saveToLibrary} onChange={handleSaveToLibraryChange} />
          Save to library
        </label>
        <button
          type="submit"
          className="rounded-md bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 md:col-span-2"
        >
          Add Combatant
        </button>
      </form>
    </section>
  );
}
