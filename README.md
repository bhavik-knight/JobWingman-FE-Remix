# JobWingman — Frontend Remix Client

This repository houses the frontend client for JobWingman, built using React, Remix, Vite, TypeScript, and TailwindCSS. It provides a local-first interface for resume upload, layout alignment evaluation, interactive suggestion committing, and PDF previews.

---

## 🛠️ Tech Stack
* **Framework**: [Remix](https://remix.run) + React
* **Build Tool**: [Vite](https://vite.dev)
* **Styling**: TailwindCSS + PostCSS
* **Package Manager**: `pnpm`
* **Language**: TypeScript

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have Node.js (v18+) and `pnpm` (v11+) installed on your machine.

### 2. Installation
Install project dependencies:
```bash
pnpm install
```

### 3. Running Locally (Development Mode)
To run the Remix development server:
```bash
pnpm run dev
```
The application will start on `http://localhost:3000`.

### 4. Configuration
By default, the client communicates with the backend Express API running at `http://localhost:5000`. You can configure the API URL by exporting:
```bash
export VITE_API_URL="http://localhost:5000"
```

### 5. Production Build
To create a production-ready bundle and run the production server:
```bash
pnpm run build
pnpm run start
```

---

## 📁 Repository Structure
* `/app`: Core frontend source files (routing, layout components, state hooks, and style utilities).
* `/app/components`: Reusable layout assets (modals, resume optimizer viewports, custom panels).
* `/app/hooks`: State orchestrator hooks (such as `useApplications.ts` for database CRUD, file ingestion, scoring, and gating workflows).
* `/app/routes`: Viewport mount points mapping URL pathways.
* `tailwind.config.js` & `postcss.config.js`: Design tokens and tailwind style selectors.
* `vite.config.ts` & `tsconfig.json`: Tooling compiler rules and bundler configurations.
