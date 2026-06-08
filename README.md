# NEXUS

**Your programming projects as a knowledge graph.**

Nexus connects to your GitHub profile and maps every repository as an interactive 3D node graph — inspired by how Wikipedia visualizes article relationships. Related projects cluster together, connections form based on shared topics and tech stacks, and you can drill into any project to explore its file tree.

---

## Features

- **3D force-directed graph** — repositories rendered as glowing nodes in a live physics simulation
- **Smart connections** — repos are linked by shared topics, tech keywords, and language families (not just same-language, which creates noise)
- **Language clustering** — same-language repos are pulled toward each other via a custom D3 force, forming natural clusters
- **30+ language colors** — each language has its canonical GitHub color
- **Click to explore** — select any node to open a glassmorphism detail panel with stars, forks, topics, dates, and connected repos
- **Expand file tree** — fetch and visualize a repo's root-level files and folders as satellite nodes directly in the graph
- **Search & filter** — search by name/description/topic, or filter the entire graph by language
- **Glassmorphism UI** — animated particle background, blur panels, gradient accents

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install & run

```bash
git clone https://github.com/frozesentic/nexus.git
cd nexus
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and enter your GitHub username.

### Using private repositories

Generate a GitHub Personal Access Token at [github.com/settings/tokens](https://github.com/settings/tokens) with `read:user` and `repo` scopes. Click **"Use private repos? Add a token"** on the login screen and paste it in.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Graph | `react-force-graph-3d` (Three.js) |
| Animations | Framer Motion |
| Styling | Tailwind CSS + custom glassmorphism |
| Data | GitHub REST API v3 |

---

## How Connections Work

Nexus builds edges between repos based on three signals, weighted by strength:

1. **Shared topics** (strongest) — if two repos share GitHub topics like `machine-learning` or `react`, they're explicitly connected. Each shared topic adds weight.
2. **Tech keyword overlap** — names and descriptions are scanned for 40+ technology keywords (React, Django, GraphQL, Docker, etc.). Repos sharing ≥2 keywords get a link.
3. **Related language families** — JavaScript ↔ TypeScript, Java ↔ Kotlin, C ↔ C++, etc. get a lightweight edge since they often coexist in the same stack.

Same-language repos are also **clustered** via a custom D3 force (without drawing noisy lines), so Python projects organically drift together even if not explicitly connected.

---

## File Tree Expansion

Click any repo node → open the detail panel → click **"Expand file tree"**. Nexus fetches the root-level contents from the GitHub API and adds them as satellite nodes in the graph:

- **Folders** — octahedral nodes in indigo
- **Files** — small spheres colored by file extension (`.ts` = blue, `.py` = Python blue, `.md` = slate, etc.)
- Clicking a file node opens it directly on GitHub

---

## License

MIT
