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
*   **Design-First Planning:** Whenever you are tasked with creating or modifying a UI component, view, or layout, you MUST read the `frontend-design` skill (`c:\Users\kent\source\repos\FamilyTreeApp\.agents\skills\frontend-design\SKILL.md`) BEFORE creating your implementation plan. Aesthetic decisions, animations, and CSS structures must be explicitly defined in the plan before writing code.

## Canvas Flow Guidelines

- **Node Interaction**: Clicking a node should open the *Node Details* tab in the right sidebar, displaying its members and allowing CRUD operations.
- **Node CRUD**:
  - *Create*: Use the "Add Node" button in the canvas toolbar. The node starts empty; members are added later.
  - *Read*: Nodes are fetched via `useCanvas` and displayed in the flow.
  - *Update*: Member membership changes are performed through the `useUpdateTreeNode` hook, which calls the domain‑level `TreeNode.UpdateMembers` method on the backend.
  - *Delete*: Use the delete button in the *Node Details* panel; this triggers the `DELETE /api/trees/{treeId}/canvas/nodes/{nodeId}` endpoint.
- **Member CRUD on Nodes**:
  - *Add Member*: In the *Node Details* tab, select members from the roster and click "Add". This calls the `UpdateTreeNodeCommand` with the new member list.
  - *Remove Member*: Deselect members and click "Remove"; the command updates the node accordingly.
  - *Read*: Member details are shown using the `CanvasMemberDto` shape, respecting visibility and masking rules.
