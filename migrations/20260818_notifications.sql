-- -----------------------------------------------------------------------
-- 12. notifications (references users)
-- -----------------------------------------------------------------------
create table if not exists public.notifications (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.users(id) on delete cascade,
  target_role  text check (target_role in ('student', 'admin', 'all')),
  title        text not null,
  message      text not null,
  type         text not null default 'system'
                 check (type in ('course_update', 'invoice_paid', 'welcome', 'new_enrollment', 'system')),
  link         text,
  is_read      boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists notifications_user_id_idx on public.notifications (user_id);
create index if not exists notifications_target_role_idx on public.notifications (target_role);
create index if not exists notifications_created_at_idx on public.notifications (created_at desc);

alter table public.notifications enable row level security;
