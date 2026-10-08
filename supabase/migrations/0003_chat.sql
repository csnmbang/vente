-- Chat: one group chat per city, for confirmed members only.
-- Paste into Supabase → SQL Editor → Run (after 0002).

-- Nickname shown in the chat ("Carmen · de San Javier"), and bans.
alter table signups add column alias     text check (char_length(alias) between 2 and 24);
alter table signups add column banned_at timestamptz;   -- set by the owner from /admin

create table messages (
  id         bigint generated always as identity primary key,
  city_id    integer not null references cities (id),
  signup_id  uuid not null references signups (id) on delete cascade,  -- deleting your data deletes your messages
  body       text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now(),
  hidden_at  timestamptz                                -- hidden by the owner after a report
);
create index messages_city on messages (city_id, id);
create index messages_author_day on messages (signup_id, created_at);

create table reports (
  id          bigint generated always as identity primary key,
  message_id  bigint not null references messages (id) on delete cascade,
  reporter_id uuid not null references signups (id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (message_id, reporter_id)
);

-- What the chat shows: visible messages from people who aren't banned,
-- with their nickname and pueblo (never their email).
create view chat_messages as
  select m.id, m.city_id, m.signup_id, m.body, m.created_at,
         s.alias, h.name as pueblo
  from messages m
  join signups s on s.id = m.signup_id
  join cities h on h.id = s.hometown_id
  where m.hidden_at is null and s.banned_at is null;

-- For /admin: reported messages that are still visible.
create view reported_messages as
  select m.id, m.body, m.created_at, m.signup_id, s.alias, c.name as city,
         count(r.id)::int as reports
  from messages m
  join reports r on r.message_id = m.id
  join signups s on s.id = m.signup_id
  join cities c on c.id = m.city_id
  where m.hidden_at is null
  group by m.id, s.alias, c.name;

-- Same rules as the rest: no public access, only the server's key.
alter table messages enable row level security;
alter table reports  enable row level security;
revoke all on chat_messages, reported_messages from anon, authenticated;
