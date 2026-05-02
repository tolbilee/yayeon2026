# Yayeon 2026 Development Rules

## Default project path

Work from this directory unless the user says otherwise:

`D:\NaverCloud\스톤템플개러지\2026 브릴란때\야연\yayeon2026`

## Backup rule before editing

Before editing files that contain Korean text or core homepage behavior, create local snapshots in `backups/`.

Required before substantial edits:

- `index.html`
- `index-en.html` when it exists
- Any file that contains Korean copy or user-facing event logic

Filename format:

- `backups/index_YYYYMMDD_HHMMSS_before_TASK.html`
- `backups/index-en_YYYYMMDD_HHMMSS_before_TASK.html`

Recommended after a verified milestone:

- `backups/index_YYYYMMDD_HHMMSS_after_TASK.html`
- `backups/index-en_YYYYMMDD_HHMMSS_after_TASK.html`

## Encoding safety

The site contains a lot of Korean text. Treat encoding as high risk.

Rules:

- Keep HTML files as UTF-8.
- Do not run broad text replacement across Korean content unless absolutely necessary.
- Prefer small, scoped edits.
- After editing, immediately check key Korean strings such as `프로그램 안내`, `실시간 자막`, `현재 시간`.
- If Korean text is broken, stop and restore from the latest `backups/` snapshot or Git.

## Git and backup roles

Use backups for short-term recovery while actively editing.

Use Git commits only after the page is verified in the browser or by script checks.

## Multilingual page rule

Use separate HTML pages for now:

- Korean: `index.html`
- English: `index-en.html`

Do not reintroduce runtime i18n unless explicitly requested.

## Event lottery rule

The lottery UI may exist in HTML, but winner limits must be enforced server-side with Supabase.

Current endpoint:

`/api/draw-lottery`

Current time window:

`18:30~19:50 KST`

Current daily winner cap:

`2`

Current win rate:

`0.15` by default, configurable with `LOTTERY_WIN_RATE`

Current database:

`Supabase`

Required SQL:

`supabase/lottery.sql`
