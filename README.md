# threats.alexischao.com

A personal log of notable CVEs and security incidents I'm tracking as part of my cybersecurity studies. Part of the `alexischao.com` family of subdomains (`map`, `cysa`, `data`), sharing the same design system and data pipeline.

No backend, no database, no auth — it's a static Vite + React app that reads `src/data/threats.json` at build time.

## How the data pipeline works

Entries live as a markdown table in my Obsidian vault, in a note called `Threats.md`:

```markdown
| title | cve_id | date_added | why_it_matters | link | tags |
| ----- | ------ | ---------- | --------------- | ---- | ---- |
| ...   | ...    | ...        | ...             | ...  | ...  |
```

My shared `vault-sync` script has a `threats` job that parses that table and overwrites `src/data/threats.json`. A few things to know about the generated JSON:

- Empty cells become `null` (e.g. `cve_id` is `null` for incidents without an assigned CVE).
- `date_added` is written as an ISO date string.
- `tags` has no native array support in the shared sync script, so it arrives as a **comma-separated string** (or `null`). The frontend splits it into an array at render time — see `parseTags` in `src/App.jsx`.

This repo does **not** contain a sync script itself; `vault-sync` is external and shared across subdomains.

## Adding an entry

1. Open `Threats.md` in Obsidian.
2. Add a new row to the table with:
   - `title` — short name for the CVE/incident
   - `cve_id` — the CVE ID if one's been assigned, otherwise leave blank
   - `date_added` — the date I logged it
   - `why_it_matters` — my own note on why it's worth tracking
   - `link` — source (advisory, NVD entry, vendor writeup, etc.)
   - `tags` — comma-separated, e.g. `rce, java, logging`
3. Run the `threats` job in `vault-sync`. It regenerates `src/data/threats.json` and I commit + push the change.

**Where I find candidates:** mostly [CISA's Known Exploited Vulnerabilities (KEV) catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog), plus vendor advisories and writeups I come across while studying. This is manually curated only — nothing here is auto-fetched from KEV. Layering curated notes on top of an auto-ingested KEV feed is a planned v2, which is why the data model doesn't assume every entry has a CVE ID.

## Deploy

Push to `main` and a GitHub Actions workflow (`.github/workflows/deploy.yml`) builds the Vite app and deploys `dist/` to GitHub Pages. The custom domain (`threats.alexischao.com`) is configured via a `CNAME` file in `public/`, which Vite copies into `dist/` on build.

## Local development

```bash
npm install
npm run dev
```
