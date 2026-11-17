-- People who used up their 2 tries and left an email asking to get in.
-- The owner sends them an entry link from /admin.
-- Paste into Supabase → SQL Editor → Run (after 0004).
-- Deleted when the person signs up, when the owner dismisses it, or after 30 days.

create table solicitudes (
  id         uuid primary key default gen_random_uuid(),
  email      citext not null unique,
  created_at timestamptz not null default now(),
  sent_at    timestamptz            -- when the owner sent the entry link
);

alter table solicitudes enable row level security;

select cron.schedule('vente-solicitudes-cleanup', '45 3 * * *', $$
  delete from solicitudes where created_at < now() - interval '30 days';
$$);
