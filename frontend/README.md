# EveAI Frontend

The frontend for EveAI is a modern React application that provides the user-facing experience for onboarding, lessons, schedule planning, notes, and insights.

## Overview

This app is built with:

- React
- TypeScript
- Vite
- Tailwind CSS
- React Query for server state
- Zustand for local UI and auth state

## Project structure

- src/app/ — app shell and route setup
- src/components/ — shared reusable UI components
- src/features/ — feature-based modules such as auth, dashboard, lessons, and schedule
- src/lib/ — shared utilities and API client configuration
- src/routes/ — route definitions and protected route handling
- src/stores/ — Zustand stores for auth and UI state

## Getting started

### Install dependencies

```bash
npm install
```

### Environment variables

Create a `.env.local` file in the frontend folder:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### Run locally

```bash
npm run dev
```

Open <http://localhost:5173> to view the app.

## Available scripts

- `npm run dev` — start the development server
- `npm run build` — build the production bundle
- `npm run lint` — run ESLint checks
- `npm run preview` — preview the production build locally

## Notes

The frontend expects the backend API to be running and reachable at the configured `VITE_API_BASE_URL`.
