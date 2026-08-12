---
description: 'FamilyTreeApp Frontend Architectural Guidelines'
applyTo: '**/*.tsx, **/*.ts, **/*.css'
---

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# FamilyTreeApp Frontend Context

**1. Technology Stack**
*   **Frontend:** Next.js 15 (App Router, TypeScript) styled with Vanilla CSS (CSS Modules/Variables), enforcing a dark-mode only design. State management uses TanStack Query v5 for server state and Zustand for local client state. Visual tree mapping uses React Flow v12 and Lucide React for icons.

**2. Architecture & Domain Models**
*   **Frontend Domains:** Organized via feature-driven structure (`src/features/`): Authentication (thin layer redirecting to backend Google OAuth), Dashboard (TreeTable for management), and Tree Workspace (React Flow canvas and collapsible sidebar with Roster/Details).

**3. Critical Architectural Rules & Constraints**
*   **Explicit Layer Orchestration:** Frontend must orchestrate mutations across the Canvas and Roster layers independently. Adding a new biological member is independent of creating a new visual node in the canvas and requires two separate api calls. 
*   **Canvas Editing Strategy:** Canvas coordinates are **not** persisted automatically on drag. Frontend holds local position state in Zustand. Explicit saves are required, with a 5-minute background auto-save fallback to prevent data loss.
*   **API Contracts:** When implementing features that require knowledge of the backend schema, ALWAYS consult the `open-api-spec.json` file first. It is the absolute source of truth for all backend API contracts.
