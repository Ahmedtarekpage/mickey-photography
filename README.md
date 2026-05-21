# Lumen — 3D Photography Admin

A bold, vibrant admin dashboard for a modern 3D photography studio. Built with
**Next.js 14 (App Router) + TypeScript + Tailwind CSS**.

This is a **frontend prototype**: all CRUD works against a local store persisted
to `localStorage` (no backend required). The data layer is isolated in
`lib/store.tsx` so it can be swapped for a real API/database later.

## Content model

```
Categories                     (cover image, accent color)
  └─ Brands                    (circular logo, featured flag, website)
       ├─ Photos               (portrait / landscape + optional before/after slider)
       └─ BTS Reels            (vertical videos with thumbnail)
```

## Run

```bash
npm install
npm run dev      # http://localhost:3000  → redirects to /admin
```

Other scripts: `npm run build`, `npm start`, `npm run lint`.

## Where things live

| Path | Purpose |
| --- | --- |
| `app/admin/page.tsx` | Dashboard overview (stats, featured brands) |
| `app/admin/categories/page.tsx` | Categories CRUD (grid of cards) |
| `app/admin/categories/[categoryId]/page.tsx` | Brands CRUD (circular logos) |
| `app/admin/categories/[categoryId]/brands/[brandId]/page.tsx` | Photos + BTS Reels (tabbed) |
| `lib/store.tsx` | localStorage-backed data store + CRUD |
| `lib/seed.ts` | Sample seed data |
| `lib/types.ts` | TypeScript models |
| `components/ui/` | Reusable UI (Button, Modal, ImageInput, BeforeAfterSlider, …) |
| `components/admin/` | Entity forms (Category / Brand / Photo / Reel) |

## Notes

- **Images** can be added by pasting a URL or uploading a file (stored as a data
  URL in `localStorage` — fine for a prototype, swap for real uploads in production).
- **Reset data** (top bar) restores the original sample content.
- The seed video uses a public sample MP4; replace with your own reel URLs.

## Swapping in a real backend

Replace the body of the CRUD methods in `lib/store.tsx` with `fetch` calls to your
API. The component layer already consumes them through `useStore()`, so the UI
needs no changes. For uploads, send files to S3 / a storage provider and store the
returned URL instead of a data URL.
