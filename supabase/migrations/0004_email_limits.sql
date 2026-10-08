-- Limits on the forms that send emails ("Ya estoy apuntado", "Borrar mis datos"),
-- so nobody can use up the daily email quota or flood someone's inbox.
-- Paste into Supabase → SQL Editor → Run (after 0003).
-- Only hashes are stored (never the IP or the email), and rows are deleted after 2 days.

create table email_sends (
  id         bigint generated always as identity primary key,
  ip_hash    text not null,
  email_hash text not null,
  created_at timestamptz not null default now()
);
create index email_sends_ip on email_sends (ip_hash, created_at);
create index email_sends_email on email_sends (email_hash, created_at);

alter table email_sends enable row level security;

select cron.schedule('vente-email-sends-cleanup', '30 3 * * *', $$
  delete from email_sends where created_at < now() - interval '2 days';
$$);
