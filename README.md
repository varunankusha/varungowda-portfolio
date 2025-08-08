# VarunGowda A P — Personal Website

Static portfolio with About, Gallery, Polls, and Admin (local-only) pages.

- Public site: `index.html`
- Admin: `admin.html` (default password: varun). Uses localStorage; no server required.
- Gallery and Polls are stored in the browser. For shared content, add a backend later.

## Deploy (GitHub Pages)
1. Create a GitHub repo (public). Name can be anything, or `<username>.github.io` for a user site.
2. Push this folder to the repo's `main` branch.
3. In GitHub → Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` → `/`.
4. Wait 1–2 minutes for the site to go live.

## Supabase (optional, shared data)
1. Create a Supabase project.
2. In the SQL editor, run `supabase/schema.sql`.
3. In `supabase/supabaseConfig.json`, set:
   - `url`: your project URL (https://<ref>.supabase.co)
   - `anonKey`: your project anon public key
4. Admin page can now add gallery items and polls to Supabase; homepage reads them automatically.
5. Voting uses the `public.vote` RPC to enforce one vote per authenticated user (you may loosen policies to allow anon voting).

Notes:
- For uploads, store media in Supabase Storage or external object storage and save the public URL in `storage_url`.
- If you keep localStorage fallback, both systems can coexist. 