# College data maintenance

The public source of truth is Supabase `public.colleges`. `src/data/colleges.js`
provides the local fallback. Changing the fallback does not update Supabase.

## Files

- `src/data/colleges.js`: fallback profiles and factor definitions.
- `src/lib/useColleges.js`: database loading; an empty successful response stays empty.
- `src/lib/scoring.js`: formatting and equal-weight comparisons.
- `src/components/AdminPanel.jsx`: profile editing and numeric validation.
- `src/components/AdminCutoffs.jsx`: separate admission cutoff records.
- `supabase/seed.sql`: bulk import. Review before running because it overwrites profiles.

## Rules

College IDs are permanent lowercase slugs. Admin creation uses insert so a duplicate
cannot silently overwrite an existing college. Edits update the original ID.
Package amounts use lakhs per annum; fees use lakhs; campus size uses acres.
Ratings are integers from 1 to 3, percentages from 0 to 100.
Missing numeric values are null, never invented zeroes. A comparison row with
missing or invalid numeric data is excluded for every college in that comparison.
Specialities are edited as lines and converted to an array only when saved.

Record source, reporting year, programme and placement denominator when researching
data. The existing dataset contains estimates and mixed reporting years; this code
review does not constitute an accuracy audit of those figures. Reserved cutoffs
also include estimates in the legacy seed; do not describe them as verified.

## September 2026 review

Fixed stale selected profiles after reload, an empty database being replaced with
fallback profiles, invalid scoring denominators, missing-value checks, duplicate
creation through editable IDs, newline loss in speciality editing, numeric input
validation and admin rendering after loss of the authorized session.
The production build and scoring edge cases were checked. Authenticated database
writes require verification using the admin session; no live rows were modified.
