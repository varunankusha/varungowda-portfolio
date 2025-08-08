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

## Notes
- `.nojekyll` disables Jekyll processing.
- Update links (LinkedIn, phone) in `index.html` as needed.
- Change the admin password inside `admin.html` before sharing the link. 