# Supabase Lottery Setup

This project uses Supabase for the Yayeon 2026 lucky draw event.

## 1. Create or choose a Supabase project

Use the project you want to operate the event from.

## 2. Run SQL

Open Supabase SQL Editor and run:

`supabase/lottery.sql`

This creates:

- `public.yayeon_lottery_attempts`
- `public.draw_yayeon_lottery(...)`

The RPC function uses a transaction advisory lock so that the daily winner cap stays accurate even if multiple visitors draw at nearly the same time.

## 3. Set Netlify environment variables

Add these in Netlify Site settings > Environment variables:

```text
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
LOTTERY_VISITOR_SALT=CHANGE_TO_A_LONG_RANDOM_SECRET
```

Use the Supabase `service_role` key only on Netlify server functions. Do not expose it in HTML.

## 4. Required image assets

Place these files in `images/`:

```text
images/lottery-win.png
images/lottery-lose.png
```

If they are missing, the text result still appears, but the result image will be hidden.

## 5. Current event rules

```text
Open time: 18:30~19:50 KST
Daily winners: 2
Attempt limit: 1 per visitor device/browser
```

The browser checks the time first for a clean message. The Netlify Function checks the time again as the source of truth.

