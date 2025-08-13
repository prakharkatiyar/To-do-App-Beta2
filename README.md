# Vercel ToDo App (Next.js) — Refined UX

A simple, local-first ToDo app built with **Next.js App Router + TypeScript** with improved visual hierarchy and a refreshed color scheme.

## What changed
- Clear visual hierarchy in each task: title (bold) → status/due chips (muted)
- Small, low-emphasis action buttons on the **right**, revealed on hover
- Overdue tasks get an **Overdue** chip
- Clean cyan/teal dark theme

## Run locally
```bash
npm install
npm run dev
```

## Deploy to Vercel
Import the repo in Vercel and deploy — no env vars or config needed.

## New options
- **Repeat**: none, daily, weekly, monthly
- **Tag**: work / personal / health (displayed as chips)
- **Description**: optional text area; searchable
- Two-line add form: 1) Task  2) Due + Repeat + Tag + Description + Add

Search matches both title and description. All data is still local-first via `localStorage`.
