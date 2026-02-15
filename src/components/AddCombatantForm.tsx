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
    <section className="rounded-xl border border-amber-900/50 bg-[#241a14]/95 p-4 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
      <h2 className="mb-3 text-lg font-semibold text-amber-100">Add Combatant</h2>
      <form onSubmit={onSubmit} className="grid gap-2 md:grid-cols-7">
        <label className="md:col-span-2">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-amber-200">Name</span>
          <input
            ref={nameInputRef}
            value={form.name}
            onChange={handleField("name")}
            placeholder="Goblin x4"
            className="w-full rounded-md border border-amber-900/40 bg-[#1b130f] px-2 py-2 text-amber-100 placeholder:text-stone-500"
          />
        </label>
        <label>
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-amber-200">Type</span>
          <select
            value={form.type}
            onChange={handleTypeChange}
            className="h-10 w-full rounded-md border border-amber-900/40 bg-[#1b130f] px-2 text-amber-100"
          >
            <option value="player">Player</option>
            <option value="npc">NPC</option>
            <option value="monster">Monster</option>
          </select>
        </label>
        <label>
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-amber-200">Max HP</span>
          <input
            value={form.maxHp}
            onChange={handleField("maxHp")}
            inputMode="numeric"
            className="w-full rounded-md border border-amber-900/40 bg-[#1b130f] px-2 py-2 text-amber-100"
          />
        </label>
        <label>
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-amber-200">Current HP</span>
          <input
            value={form.currentHp}
            onChange={handleField("currentHp")}
            inputMode="numeric"
            className="w-full rounded-md border border-amber-900/40 bg-[#1b130f] px-2 py-2 text-amber-100"
          />
        </label>
        <label>
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-amber-200">AC</span>
          <input
            value={form.ac}
            onChange={handleField("ac")}
            inputMode="numeric"
            className="w-full rounded-md border border-amber-900/40 bg-[#1b130f] px-2 py-2 text-amber-100"
          />
        </label>
        <label>
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-amber-200">Initiative</span>
          <input
            value={form.initiative}
            onChange={handleField("initiative")}
            inputMode="numeric"
            className="w-full rounded-md border border-amber-900/40 bg-[#1b130f] px-2 py-2 text-amber-100"
          />
        </label>
        <label className="md:col-span-3 inline-flex items-center gap-2 text-sm text-amber-200">
          <input type="checkbox" checked={form.saveToLibrary} onChange={handleSaveToLibraryChange} />
          Save to library
        </label>
        <button
          type="submit"
          className="md:col-span-2 rounded-md bg-[#7a4e1d] px-3 py-2 text-sm font-semibold text-amber-50 hover:bg-[#8b5b23]"
        >
          Add Combatant
        </button>
      </form>
    </section>
  );
}
