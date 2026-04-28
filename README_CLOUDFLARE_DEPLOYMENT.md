# Microbex Onboarding - Cloudflare Deployment Notes

This ZIP keeps the existing local backend for development and adds a Cloudflare-ready backend using Pages Functions.

## What changed

### Frontend
- `frontend/src/App.jsx`
  - Changed API call from hard-coded `http://localhost:5000/api/email` to configurable API base URL.
  - In Cloudflare production, it calls `/api/email` on the same domain.
  - For local Express testing, use `frontend/.env.local` with `VITE_API_BASE_URL=http://localhost:5000`.

- `frontend/src/App.css`
  - Added Microbex-style basic UI.

- `frontend/package.json`
  - Added `build`, `preview`, and `pages:dev` scripts.
  - Added `postgres` dependency for Cloudflare Pages Function.
  - Added `wrangler` as dev dependency.

### Cloudflare backend
- `frontend/functions/api/email.js`
  - New Cloudflare Pages Function.
  - Accepts `POST /api/email`.
  - Validates email.
  - Inserts into `onboarding.email_leads` using Hyperdrive.
  - Handles duplicate email with HTTP 409.

### Cloudflare config
- `frontend/wrangler.jsonc`
  - Added Hyperdrive binding placeholder.
  - Replace `PASTE_YOUR_HYPERDRIVE_ID_HERE` with your Cloudflare Hyperdrive ID.

### Database
- `frontend/schema.sql`
  - Supabase/PostgreSQL schema and table creation script.

## Local testing with current Express backend

1. Start backend:

```bash
cd backend
npm install
npm run dev
```

2. Create `frontend/.env.local`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

3. Start frontend:

```bash
cd frontend
npm install
npm run dev
```

4. Open:

```txt
http://localhost:5173
```

## Cloudflare deployment setup

### 1. Supabase
Run `frontend/schema.sql` in Supabase SQL Editor.

### 2. Cloudflare Hyperdrive
Create Hyperdrive connection to Supabase PostgreSQL.
Copy the Hyperdrive ID.

### 3. Update wrangler config
Open:

```txt
frontend/wrangler.jsonc
```

Replace:

```txt
PASTE_YOUR_HYPERDRIVE_ID_HERE
```

with your actual Hyperdrive ID.

### 4. GitHub push
Commit and push the repo.

### 5. Cloudflare Pages project settings
Use these settings:

```txt
Root directory: frontend
Framework preset: Vite
Build command: npm run build
Build output directory: dist
```

### 6. Bind Hyperdrive in Cloudflare Pages
In Cloudflare Pages project:

```txt
Settings → Bindings → Hyperdrive
Variable name: HYPERDRIVE
Select your Hyperdrive configuration
```

Redeploy after adding the binding.

### 7. Custom domain
Add custom domain:

```txt
onboarding.microbex.in
```

## Important production behavior

In production, the frontend calls:

```txt
/api/email
```

So the API URL becomes:

```txt
https://onboarding.microbex.in/api/email
```

The local `backend/server.js` is not used by Cloudflare deployment.
