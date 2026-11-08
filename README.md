# Quiz Master

React + Vite + Tailwind quiz app backed by Supabase.

## Run locally
1. `cp .env.example .env` and fill in your Supabase URL and anon key (Project Settings > API).
2. `npm install`
3. `npm run dev`

## Deploy to GitHub Pages
1. Push to a GitHub repo with a `main` branch.
2. Repo Settings > Secrets and variables > Actions: add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Repo Settings > Pages: set Source to "GitHub Actions".
4. Push to `main`. The workflow builds and publishes the site.
