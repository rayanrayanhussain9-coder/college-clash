-- CollegeClash data update — Chandigarh University, Mohali (2025–26)
-- Run this once in Supabase Dashboard → SQL Editor → New query.
-- Sources used: NIRF 2025 Engineering submission/rankings and Chandigarh
-- University's 2025 disclosure, placements, hostel and admission pages.

insert into public.colleges
  (id, name, city, type, accent, tagline, image, thumb, specialities, factors)
values
  (
    'chandigarh-university',
    'Chandigarh University',
    'Gharuan, Mohali, Punjab',
    'Engineering (Private)',
    '#e85d75',
    'NIRF Engineering 2025 #31 — a large, industry-connected private university in Mohali.',
    'https://mma.prnewswire.com/media/1520871/Chandigarh_University_Mohali.jpg?p=facebook',
    'https://mma.prnewswire.com/media/1520871/Chandigarh_University_Mohali.jpg?p=facebook',
    '["CSE, AI & Data Science","1,300+ companies visited (2024–25)","Industry-sponsored labs","NAAC A+ & NBA-accredited programmes"]'::jsonb,
    '{"ranking":31,"reputation":2,"avgPackage":null,"medianPackage":8,"highestPackage":59.9,"placementRate":37.1,"recruiters":3,"fees":13,"feesRange":"₹10.2–15.8 L (4 yr tuition + hostel)","facultyRatio":14,"research":58,"infrastructure":3,"accreditation":"NAAC A+ · NBA programmes","exam":"CUCET 2026","campusAcres":153,"location":"Semi-urban · Gharuan, Mohali"}'::jsonb
  )
on conflict (id) do update set
  name = excluded.name,
  city = excluded.city,
  type = excluded.type,
  accent = excluded.accent,
  tagline = excluded.tagline,
  image = excluded.image,
  thumb = excluded.thumb,
  specialities = excluded.specialities,
  factors = excluded.factors;

-- IIT Mandi's official NIRF Engineering 2025 rank is #26, not #31.
update public.colleges
set factors = jsonb_set(coalesce(factors, '{}'::jsonb), '{ranking}', '26'::jsonb)
where id = 'iit-mandi';
