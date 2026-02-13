import { useEffect, useMemo, useRef, useState } from "react";
import AddCombatantForm, { type AddCombatantFormState } from "./components/AddCombatantForm";
import HeaderBar from "./components/HeaderBar";
import InitiativeList from "./components/InitiativeList";
import LibraryList from "./components/LibraryList";
import SavedEncounters from "./components/SavedEncounters";
import { useAppStore } from "./store";
import type { NewCombatantInput } from "./types";

const initialForm: AddCombatantFormState = {
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
    setCurrentHp,
    setMaxHp,
    setAc,
    setInitiative,
    setStatBlockUrl,
    previousTurn,
    nextTurn,
    saveActiveEncounter,
    loadEncounter,
    deleteEncounter,
    deleteLibraryCombatant,
  } = useAppStore();

  const [form, setForm] = useState<AddCombatantFormState>(initialForm);
  const [encounterName, setEncounterName] = useState("Session Encounter");
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    init();
  }, []);

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
      statBlockUrl: undefined,
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

  const activeCombatant =
    orderedCombatants.find((combatant) => combatant.id === activeEncounter.activeCombatantId) ?? null;
  const activeLabel = activeCombatant?.name ?? "None";
  const firstInitiativeCombatantId = orderedCombatants[0]?.id ?? null;
  const isPreviousTurnDisabled =
    orderedCombatants.length === 0 ||
    (activeEncounter.round === 1 && activeEncounter.activeCombatantId === firstInitiativeCombatantId);

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
        <HeaderBar
          round={activeEncounter.round}
          activeLabel={activeLabel}
          activeType={activeCombatant?.type ?? null}
          encounterName={encounterName}
          onEncounterNameChange={setEncounterName}
          onPreviousTurn={() => void previousTurn()}
          isPreviousTurnDisabled={isPreviousTurnDisabled}
          onNextTurn={() => void nextTurn()}
          onCreateEncounter={createEncounter}
          onSaveEncounter={() => void saveActiveEncounter(encounterName)}
        />

        <AddCombatantForm
          form={form}
          nameInputRef={nameInputRef}
          onChange={setForm}
          onSubmit={(event) => void handleAddCombatant(event)}
        />

        <InitiativeList
          combatants={orderedCombatants}
          activeCombatantId={activeEncounter.activeCombatantId}
          onUpdateHp={(combatantId, delta) => void updateHp(combatantId, delta)}
          onSetCurrentHp={(combatantId, nextHp) => void setCurrentHp(combatantId, nextHp)}
          onSetMaxHp={(combatantId, nextHp) => void setMaxHp(combatantId, nextHp)}
          onSetAc={(combatantId, nextAc) => void setAc(combatantId, nextAc)}
          onSetInitiative={(combatantId, nextInitiative) => void setInitiative(combatantId, nextInitiative)}
          onSetStatBlockUrl={(combatantId, url) => void setStatBlockUrl(combatantId, url)}
          onDuplicateCombatant={(combatantId) => void duplicateCombatant(combatantId)}
          onDeleteCombatant={(combatantId) => void deleteCombatant(combatantId)}
        />

        <SavedEncounters
          encounters={encounters}
          onLoadEncounter={loadEncounter}
          onDeleteEncounter={(encounterId) => void deleteEncounter(encounterId)}
        />

        <LibraryList
          libraryCombatants={libraryCombatants}
          onAddFromLibrary={(combatantId) => void addCombatantFromLibrary(combatantId)}
          onDeleteFromLibrary={(combatantId) => void deleteLibraryCombatant(combatantId)}
        />
      </div>
    </main>
  );
}
