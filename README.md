# hunter mark

Simple RPG (D&D) combat tracker, made for me mostly for my in-person tables but can be useful to other people.

Features:
- add players, NPCs, and monsters quickly
- track initiative and turns
- edit current/max HP fast
- duplicate/remove combatants
- save/load encounters
- save combatants to a reusable library

## tech stack

- React + TypeScript
- Vite
- Zustand
- Dexie (IndexedDB)
- Tailwind CSS

## setup

Requirements:
- Node.js 18+ (or newer LTS)

Install dependencies:

```bash
npm install
```

## run locally

Start dev server:

```bash
npm run dev
```

Then open the local URL shown in terminal (usually `http://localhost:5173`).

## build

Create production build:

```bash
npm run build
```

Preview production build locally:

```bash
npm run preview
```
