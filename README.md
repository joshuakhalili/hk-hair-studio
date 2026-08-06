# HK Hair Studio — website

Two proposed sites for **HK Hair Studio**, a hair salon and barbershop in Cambridge.
Built by **Crescendo**.

```
index.html        launcher — Option A / Option B / compare
essentials/       Tier 1 · the £200 build. Finished.
signature/        Tier 2 · the £1,000 build. Holding page.
compare/          side-by-side view of both, for the pitch
assets/img/       11 photographs — the salon's work and the salon
assets/switch.*   the A/B switcher shared by both tier pages
```

Plain HTML and CSS. No framework, no build step, no dependencies.
Open `index.html` in a browser and it works — locally or hosted.

## Showing both options

Two ways, both built for demoing rather than for customers.

**Flip.** Every tier page carries a switcher pill at the bottom. Press <kbd>1</kbd> for
Option A, <kbd>2</kbd> for Option B, <kbd>C</kbd> for compare, <kbd>Esc</kbd> for the
launcher. It **keeps your place** — flip at the services section and you land at the
services section on the other one. That is the pitch move: same content, same spot,
two treatments, no loading screen between them.

**Side by side.** `compare/` puts both in one screen with linked scrolling, a draggable
divider, swap-sides, and Desktop / Tablet / Phone width presets. Same keys, plus
<kbd>3</kbd> back to split, <kbd>L</kbd> to unlink scrolling, <kbd>S</kbd> to swap,
<kbd>T</kbd> to send both to the top.

**Linked scrolling needs the pages served, not opened as files.** A `file://` page can't
read inside its own frames, so `compare/` shows a note and turns linking off. Everything
else still works. On the GitHub Pages URL, or via `python3 -m http.server`, it's fine.

The switcher hides itself inside the compare view, so you never see two of them.

## Publishing

Settings → Pages → Deploy from a branch → `main` → `/ (root)` → Save.
Live in about a minute at `https://joshuakhalili.github.io/hk-hair-studio/`.

Repo must be **public** for Pages on a free plan.

## Editing

`essentials/index.html` is the real page. Images are referenced from `assets/img/`,
so you can swap a photograph by dropping in a file of the same name — no code change.

All prices, opening hours, stylist names and ratings come from the salon's live
Treatwell listing (**venue 462045**). If you change a price here, change it there
first — Treatwell is what the customer is actually charged.

### The one config block

Top of `essentials/index.html`:

| Slot | Status |
|---|---|
| `TREATWELL_WIDGET_URL`  | filled — venue 462045 |
| `TREATWELL_PROFILE_URL` | filled |
| `SUPABASE_URL`          | empty |
| `SUPABASE_ANON_KEY`     | empty |

Leave Supabase empty and the enquiry form hands off to WhatsApp instead of writing
to a database. Nothing breaks.

```sql
create table enquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text, phone text, email text,
  service text, message text, source text default 'website'
);
```
RLS: insert-only for `anon`, no select.

## Images

All local. `assets/img/` holds eleven files — six work photographs and five salon
shots — and **no page makes a remote image request**. The only external requests are
Google Fonts and the Treatwell booking widget, both deliberate.

They used to be hotlinked from Treatwell's CDN. One of those URLs was dead within a
day of being written down, so don't reintroduce the pattern: if you add a photograph,
add the file.

---

Project documentation, research and planning live in the Crescendo client folder,
not in this repo.
