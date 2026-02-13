import { useEffect, useMemo, useRef, useState } from "react";
import { useAppStore } from "./store";
import type { CombatantType, NewCombatantInput } from "./types";

type FormState = {
  name: string;
  type: CombatantType;
  maxHp: string;
  currentHp: string;
  ac: string;
  initiative: string;
  saveToLibrary: boolean;
};

const initialForm: FormState = {
  name: "",
  type: "monster",
  maxHp: "10",
  currentHp: "10",
  ac: "12",
  initiative: "10",
  saveToLibrary: false,
};

const parseNameAndCount = (rawName: string) => {
  const trimmed = rawName.trim();
  const match = trimmed.match(/^(.*)\sx(\d+)$/i);
  if (!match) {
    return { name: trimmed, count: 1 };
  }

  const parsedCount = Number(match[2]);
  return {
    name: match[1].trim(),
    count: Number.isFinite(parsedCount) ? Math.max(1, parsedCount) : 1,
  };
};

export default function App() {
  const {
    loading,
    libraryCombatants,
    encounters,
    activeEncounter,
    init,
    createEncounter,
    addCombatant,
    addCombatantFromLibrary,
    duplicateCombatant,
    deleteCombatant,
    updateHp,
    nextTurn,
    saveActiveEncounter,
    loadEncounter,
    deleteEncounter,
    deleteLibraryCombatant,
  } = useAppStore();

  const [form, setForm] = useState<FormState>(initialForm);
  const [encounterName, setEncounterName] = useState("Session Encounter");
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    localStorage.setItem("hm-active-encounter", JSON.stringify(activeEncounter));
  }, [activeEncounter]);

  const orderedCombatants = useMemo(
    () => [...activeEncounter.combatants].sort((a, b) => b.initiative - a.initiative),
    [activeEncounter.combatants]
  );

  const handleAddCombatant = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { name, count } = parseNameAndCount(form.name);
    if (!name) {
      return;
    }

    const baseInput: Omit<NewCombatantInput, "name"> = {
      type: form.type,
      maxHp: Number(form.maxHp),
      currentHp: Number(form.currentHp),
      ac: Number(form.ac),
      initiative: Number(form.initiative),
    };

    for (let index = 0; index < count; index += 1) {
      await addCombatant(
        {
          ...baseInput,
          name: count > 1 ? `${name} ${index + 1}` : name,
        },
        { saveToLibrary: form.saveToLibrary }
      );
    }

    setForm((prev) => ({ ...prev, name: "" }));
    nameInputRef.current?.focus();
  };

  const activeLabel =
    orderedCombatants.find((combatant) => combatant.id === activeEncounter.activeCombatantId)?.name ?? "None";

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <p>Loading encounter data...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl p-4 md:p-6 space-y-4">
        <header className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold">Hunter Mark</h1>
            <span className="text-xs rounded-full bg-slate-800 px-2 py-1">
              Round {activeEncounter.round}
            </span>
            <span className="text-xs rounded-full bg-slate-800 px-2 py-1">
              Active: {activeLabel}
            </span>
            <button
              type="button"
              onClick={() => void nextTurn()}
              className="ml-auto rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold hover:bg-emerald-500"
            >
              Next Turn
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={createEncounter}
              className="rounded-md bg-slate-700 px-3 py-2 text-sm hover:bg-slate-600"
            >
              New Encounter
            </button>
            <button
              type="button"
              onClick={() => void saveActiveEncounter(encounterName)}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm hover:bg-indigo-500"
            >
              Save Encounter
            </button>
            <input
              value={encounterName}
              onChange={(event) => setEncounterName(event.target.value)}
              className="rounded-md border border-slate-700 bg-slate-950 px-2 py-2 text-sm"
              placeholder="Encounter name"
            />
          </div>
        </header>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <h2 className="mb-3 text-lg font-semibold">Add Combatant</h2>
          <form onSubmit={(event) => void handleAddCombatant(event)} className="grid gap-2 md:grid-cols-7">
            <label className="md:col-span-2">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-300">
                Name
              </span>
              <input
                ref={nameInputRef}
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Goblin x4"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-2"
              />
            </label>
            <label>
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-300">
                Type
              </span>
              <select
                value={form.type}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, type: event.target.value as CombatantType }))
                }
                className="h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-2"
              >
                <option value="player">Player</option>
                <option value="npc">NPC</option>
                <option value="monster">Monster</option>
              </select>
            </label>
            <label>
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-300">
                Max HP
              </span>
              <input
                value={form.maxHp}
                onChange={(event) => setForm((prev) => ({ ...prev, maxHp: event.target.value }))}
                inputMode="numeric"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-2"
              />
            </label>
            <label>
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-300">
                Current HP
              </span>
              <input
                value={form.currentHp}
                onChange={(event) => setForm((prev) => ({ ...prev, currentHp: event.target.value }))}
                inputMode="numeric"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-2"
              />
            </label>
            <label>
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-300">
                AC
              </span>
              <input
                value={form.ac}
                onChange={(event) => setForm((prev) => ({ ...prev, ac: event.target.value }))}
                inputMode="numeric"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-2"
              />
            </label>
            <label>
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-300">
                Initiative
              </span>
              <input
                value={form.initiative}
                onChange={(event) => setForm((prev) => ({ ...prev, initiative: event.target.value }))}
                inputMode="numeric"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-2"
              />
            </label>
            <label className="md:col-span-3 inline-flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={form.saveToLibrary}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, saveToLibrary: event.target.checked }))
                }
              />
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

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <h2 className="mb-3 text-lg font-semibold">Initiative Order</h2>
          <div className="space-y-2">
            {orderedCombatants.length === 0 ? (
              <p className="text-sm text-slate-400">No combatants yet.</p>
            ) : (
              orderedCombatants.map((combatant) => (
                <article
                  key={combatant.id}
                  className={`grid gap-2 rounded-md border p-3 md:grid-cols-12 ${
                    combatant.id === activeEncounter.activeCombatantId
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
                      onClick={() => void updateHp(combatant.id, -5)}
                      className="rounded bg-rose-700 px-2 py-1 text-sm hover:bg-rose-600"
                    >
                      -5
                    </button>
                    <button
                      type="button"
                      onClick={() => void updateHp(combatant.id, -1)}
                      className="rounded bg-rose-700 px-2 py-1 text-sm hover:bg-rose-600"
                    >
                      -1
                    </button>
                    <p className="min-w-24 text-center text-sm">
                      HP {combatant.currentHp}/{combatant.maxHp}
                    </p>
                    <button
                      type="button"
                      onClick={() => void updateHp(combatant.id, +1)}
                      className="rounded bg-sky-700 px-2 py-1 text-sm hover:bg-sky-600"
                    >
                      +1
                    </button>
                    <button
                      type="button"
                      onClick={() => void updateHp(combatant.id, +5)}
                      className="rounded bg-sky-700 px-2 py-1 text-sm hover:bg-sky-600"
                    >
                      +5
                    </button>
                  </div>
                  <div className="md:col-span-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => void duplicateCombatant(combatant.id)}
                      className="rounded bg-slate-700 px-3 py-2 text-sm hover:bg-slate-600"
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteCombatant(combatant.id)}
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
                    onClick={() => loadEncounter(encounter.id)}
                    className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 pr-8 text-sm hover:border-slate-500"
                  >
                    {encounter.name} ({encounter.combatants.length})
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${encounter.name}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      void deleteEncounter(encounter.id);
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

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <h2 className="mb-3 text-lg font-semibold">Library</h2>
          {libraryCombatants.length === 0 ? (
            <p className="text-sm text-slate-400">
              No saved combatants yet. Check "Save to library" when adding one.
            </p>
          ) : (
            <div className="space-y-2">
              {libraryCombatants.map((combatant) => (
                <article
                  key={combatant.id}
                  className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{combatant.name}</p>
                    <p className="text-xs uppercase text-slate-400">
                      {combatant.type} | HP {combatant.currentHp}/{combatant.maxHp} | AC {combatant.ac} | Init{" "}
                      {combatant.initiative}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void addCombatantFromLibrary(combatant.id)}
                    className="rounded bg-emerald-700 px-3 py-1.5 text-xs font-semibold hover:bg-emerald-600"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${combatant.name}`}
                    onClick={() => void deleteLibraryCombatant(combatant.id)}
                    className="rounded px-2 py-1 text-xs text-slate-400 hover:bg-rose-800 hover:text-rose-100"
                  >
                    x
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
