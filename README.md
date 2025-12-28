# Inventory App

Minimal full-stack inventory app (Node/Express backend + Vite + React frontend).

## Setup

From project root:

```bash
cd "/Users/familyfaulkner/VS Code Workspaces/First/inventory-app"
# Install backend
cd backend && npm install
# Install frontend
cd ../frontend && npm install
```

## Run (dev)

Open two terminals:

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm run dev
```

Backend runs at `http://localhost:4000` and frontend at `http://localhost:5173`.

API endpoints: `GET/POST /api/items`, `PUT /api/items/:id`, `DELETE /api/items/:id`.
