# Frontend – Private-Label Inventory System

This folder contains the **web UI** of the project. The backend (Express + PostgreSQL) already exists in the repository root – this `frontend/` directory is a **Next.js app** that talks to it.

---

## 1. Quick Start

```bash
# 1. Install once
cd frontend
npm install

# 2. Run the dev server ( http://localhost:3000 )
npm run dev
```

The UI will automatically reload when you edit files.

> **Heads-up:** The backend must be running (default `http://localhost:5000`). If you use a different port / URL, set the variable below.

---

## 2. Environment Variables

Just create a `.env` file with the .env.example content.

## 3. Tech Stack

| Tool                      | Why we use it                                        |
| ------------------------- | ---------------------------------------------------- |
| **Next.js 15**            | React framework – provides routing & fast dev server |
| **React 19**              | UI library you write components with                 |
| **Tailwind CSS 4**        | Utility-first CSS – no custom SCSS setup needed      |
| **@tanstack/react-query** | Handles data fetching / caching                      |
| **Axios**                 | Simple HTTP client                                   |
| **Prettier + ESLint**     | Keeps code tidy & consistent                         |

Everything is plain **JavaScript**

---

## 4. Project Structure (high level)

```
frontend/
├── src/
│   ├── app/            # Next.js routing – pages & layouts
│   ├── components/     # Re-usable UI widgets (Button, Card, Spinner…)
│   ├── hooks/          # Custom React hooks (e.g. useHealth)
│   ├── services/       # Small files – 1 per backend endpoint
│   ├── utils/          # General helpers (env resolver, etc.)
│   └── config/         # App-wide constants (API base URL, ENV)
└── public/             # Static assets (icons, images…)
```

**Rule of thumb:**

- **Display logic?** ‑> `components/`
- **Calls the server?** ‑> `services/` + a hook in `hooks/`

---

## 5. Adding a New API call in 3 Steps

1. **Service** – create `src/services/yourFeatureService.js`:
   ```js
   import api from '@/lib/api';
   export const getSomething = () => api.get('/your-endpoint');
   ```
2. **Hook** – create `src/hooks/useSomething.js`:

   ```js
   import { useQuery } from '@tanstack/react-query';
   import { getSomething } from '@/services/yourFeatureService';

   export const useSomething = () => useQuery(['something'], getSomething);
   ```

3. **UI** – consume the hook in any component / page:
   ```js
   const { data, isLoading } = useSomething();
   ```

React-Query caches, retries and updates automatically.

---

## 6. Formatting, Linting & Pre-commit

```bash
npm run lint     # ESLint + Prettier integration
npm run format   # Prettier write-all
```

`husky` + `lint-staged` run Prettier on staged files when you commit.

---

## 7. Building for Production

```
# Build the static output
npm run build

# Start the production server on the same port (default 3000)
npm run start
```

That’s all bro
