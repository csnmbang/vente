-- Vente v1 schema. Paste into Supabase → SQL Editor → Run.
-- The browser never talks to the database: the Next.js server uses the
-- service-role key. RLS is on everywhere with no policies, so the anon key
-- can read nothing.

create extension if not exists citext;
create extension if not exists pg_trgm;

-- ---------------------------------------------------------------------------
-- Reference data (loaded by `npm run import:geo`)
-- ---------------------------------------------------------------------------

-- Places people can pick: cities abroad (current city) and Spanish municipios
-- (hometown). Coordinates are the place centre from GeoNames.
create table cities (
  id              integer primary key,          -- GeoNames id
  name            text not null,                -- display name, Spanish if available
  country_code    char(2) not null,
  admin1_code     text,                         -- ES: autonomous community code
  admin1_name     text,                         -- region / comunidad autónoma
  admin2_name     text,                         -- ES: province
  lat             double precision not null,
  lng             double precision not null,
  population      integer not null default 0,
  search          text not null,                -- lowercase, unaccented name + alternate names
  is_abroad       boolean not null default false, -- selectable as "where you live now"
  is_es_municipio boolean not null default false  -- selectable as hometown
);
create index cities_search_trgm on cities using gin (search gin_trgm_ops);
create index cities_abroad on cities (population desc) where is_abroad;
create index cities_es on cities (population desc) where is_es_municipio;

-- Postcode areas. One row per (country, postcode); lat/lng is the centre of
-- the area, never an address.
create table postcodes (
  id           bigint generated always as identity primary key,
  country_code char(2) not null,
  postcode     text not null,                   -- normalised: uppercase, no spaces
  place_name   text,
  lat          double precision not null,
  lng          double precision not null,
  unique (country_code, postcode)
);

-- ---------------------------------------------------------------------------
-- Quiz
-- ---------------------------------------------------------------------------

create table quiz_attempts (
  id                uuid primary key default gen_random_uuid(),
  ip_hash           text,                       -- HMAC(ip); nulled after 7 days
  question_ids      text[] not null,            -- the 10 drawn questions, in order
  option_orders     jsonb not null,             -- shuffled option order per question
  results           boolean[] not null default '{}', -- correct? per answered question
  current_index     smallint not null default 0,
  current_served_at timestamptz not null default now(),
  correct_count     smallint not null default 0,
  status            text not null default 'in_progress'
                    check (status in ('in_progress', 'passed', 'failed')),
  signup_used       boolean not null default false,
  created_at        timestamptz not null default now(),
  finished_at       timestamptz
);
create index quiz_attempts_ip_recent on quiz_attempts (ip_hash, created_at desc);

-- ---------------------------------------------------------------------------
-- Sign-ups: the only personal data we hold.
-- ---------------------------------------------------------------------------

create table signups (
  id           uuid primary key default gen_random_uuid(),
  email        citext not null unique,
  city_id      integer not null references cities (id),
  postcode_id  bigint references postcodes (id),
  hometown_id  integer not null references cities (id),
  attempt_id   uuid not null unique references quiz_attempts (id),
  confirmed_at timestamptz,                     -- null until the email link is clicked
  created_at   timestamptz not null default now()
);
create index signups_city on signups (city_id) where confirmed_at is not null;
create index signups_postcode on signups (postcode_id) where confirmed_at is not null;

-- ---------------------------------------------------------------------------
-- Public aggregates for the map. Counts only, never people.
-- ---------------------------------------------------------------------------

create view city_counts as
  select c.id as city_id, c.name, c.country_code, c.lat, c.lng, count(*)::int as people
  from signups s join cities c on c.id = s.city_id
  where s.confirmed_at is not null
  group by c.id;

-- Zoomed-in layer: one point per postcode area; people who skipped the
-- postcode are shown at their city centre.
create view zone_counts as
  select 'p' || p.id as zone_id, p.postcode as label, c.name as city_name,
         p.lat, p.lng, count(*)::int as people
  from signups s
  join postcodes p on p.id = s.postcode_id
  join cities c on c.id = s.city_id
  where s.confirmed_at is not null
  group by p.id, c.name
  union all
  select 'c' || c.id, null, c.name, c.lat, c.lng, count(*)::int
  from signups s join cities c on c.id = s.city_id
  where s.confirmed_at is not null and s.postcode_id is null
  group by c.id;

-- ---------------------------------------------------------------------------
-- Lock everything down. No policies = no access for anon/authenticated roles.
-- ---------------------------------------------------------------------------

alter table cities        enable row level security;
alter table postcodes     enable row level security;
alter table quiz_attempts enable row level security;
alter table signups       enable row level security;

revoke all on city_counts, zone_counts from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Housekeeping (pg_cron). Daily at 03:00 UTC:
--  * forget IP hashes and question draws older than 7 days (scores stay so
--    share links keep working),
--  * delete sign-ups never confirmed within 7 days.
-- ---------------------------------------------------------------------------

create extension if not exists pg_cron;

select cron.schedule('vente-cleanup', '0 3 * * *', $$
  update quiz_attempts
     set ip_hash = null, option_orders = '[]'::jsonb
   where created_at < now() - interval '7 days' and ip_hash is not null;
  delete from signups
   where confirmed_at is null and created_at < now() - interval '7 days';
$$);
