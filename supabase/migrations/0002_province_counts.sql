-- Feature 2: where each city's Spaniards are from, by province.
-- Paste into Supabase → SQL Editor → Run (after 0001).
-- Counts only, and only at province level: pueblo-level data stays private
-- until members-only features exist.

create view city_province_counts as
  select s.city_id, h.admin2_name as provincia, count(*)::int as people
  from signups s
  join cities h on h.id = s.hometown_id
  where s.confirmed_at is not null
  group by s.city_id, h.admin2_name;

revoke all on city_province_counts from anon, authenticated;
