# CollegeClash

Compare India's top recognized colleges across 15 factors — ranking, packages,
placements, fees and more — with a cinematic dark UI, a 5-second auto-rotating
hero carousel, 3D scroll storytelling, and a green/red comparison table that
crowns a winner.

## Run it

```bash
npm install      # first time only
npm run dev      # start the dev server
```

Then open the printed URL (usually http://localhost:5173/).

```bash
npm run build    # production build into dist/
npm run preview  # preview the production build
```

## How it works

1. The hero shows a rotating carousel of featured colleges (changes every 5s).
2. Scrolling lifts the explainer text up over the images with a 3D tilt.
3. Hit the `+` cards to add **2–4 colleges**.
4. A 15-factor table appears — **best value per row glows green, worst glows red**.
5. Each factor is normalised and scored equally; totals produce a ranked verdict
   and a **winner**.

## Adding or editing colleges

All data lives in [`src/data/colleges.js`](src/data/colleges.js). To add a
college, copy any existing object in the `COLLEGES` array, change the values, and
append it. Every college needs all 15 keys listed in `FACTORS` (same file).
Numbers are curated/approximate — refine them anytime.

- Factor directions are set once in `FACTORS` (`higherIsBetter: false` means a
  smaller number wins, e.g. ranking, fees, student–faculty ratio).
- Scoring + colour logic lives in [`src/lib/scoring.js`](src/lib/scoring.js).
- Photos use LoremFlickr (keyword-matched stock) with a gradient fallback, so a
  missing photo never looks broken. Swap `image` for a real campus photo URL to
  use your own.

## Project structure

```
src/
  data/colleges.js        the dataset + factor definitions
  lib/scoring.js          normalisation, scoring, ranking, cell colours
  components/             Hero, BackgroundCarousel, ScrollStory,
                          CompareBuilder, CollegePicker, ComparisonTable,
                          Specialities, Verdict, CollegeImage
  App.jsx                 composition + selection state
  index.css               full dark/neon design system
```
