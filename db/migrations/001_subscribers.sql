-- Newsletter subscribers. An address only receives mail once confirmed (double opt-in).
create table subscribers (
  email        text primary key,
  status       text not null check (status in ('pending', 'confirmed', 'unsubscribed')),
  created_at   timestamptz not null default now(),
  confirmed_at timestamptz
);

create index subscribers_status on subscribers (status);
