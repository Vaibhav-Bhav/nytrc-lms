-- =======================================================================
-- NYTRC LMS — Supabase Schema (Complete Production Baseline - Sprint 5.2)
-- Run this entire script once in the Supabase SQL Editor.
-- Tables are created in foreign-key dependency order.
-- =======================================================================

-- -----------------------------------------------------------------------
-- 1. users
-- -----------------------------------------------------------------------
create table if not exists public.users (
  id                      uuid primary key default gen_random_uuid(),
  email                   text not null unique,
  name                    text not null,
  mobile                  text,
  state                   text,
  role                    text not null default 'student'
                            check (role in ('admin', 'student')),
  password_hash           text not null,
  is_active               boolean not null default true,
  force_password_change   boolean not null default false,
  reset_token             text unique,
  reset_token_expires_at  timestamptz,
  last_login_at           timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index if not exists users_email_idx on public.users (email);

-- -----------------------------------------------------------------------
-- 2. sessions  (references users)
-- -----------------------------------------------------------------------
create table if not exists public.sessions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.users(id) on delete cascade,
  token              text not null unique,
  refresh_token      text unique,
  device_identifier  text,
  browser            text,
  os                 text,
  ip_address         text,
  location_metadata  jsonb,
  is_active          boolean not null default true,
  expires_at         timestamptz not null,
  created_at         timestamptz not null default now()
);

create index if not exists sessions_user_id_is_active_idx
  on public.sessions (user_id, is_active);

create index if not exists sessions_token_active_idx
  on public.sessions (token)
  where is_active = true;

-- -----------------------------------------------------------------------
-- 3. courses  (references users)
-- -----------------------------------------------------------------------
create table if not exists public.courses (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  description    text,
  thumbnail_url  text,
  price          numeric(10, 2) not null default 0.00,
  status         text not null default 'draft'
                   check (status in ('draft', 'published')),
  created_by     uuid not null references public.users(id),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists courses_status_idx on public.courses (status);

-- -----------------------------------------------------------------------
-- 4. leads  (references courses)
-- -----------------------------------------------------------------------
create table if not exists public.leads (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  email               text not null,
  mobile              text,
  state               text,
  course_id           uuid references public.courses(id) on delete set null,
  razorpay_order_id   text,
  status              text not null default 'initiated'
                        check (status in ('initiated', 'paid', 'failed')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists leads_email_idx on public.leads (email);
create index if not exists leads_razorpay_order_id_idx on public.leads (razorpay_order_id);

-- -----------------------------------------------------------------------
-- 5. sections  (references courses)
-- -----------------------------------------------------------------------
create table if not exists public.sections (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid not null references public.courses(id) on delete cascade,
  title         text not null,
  order_number  integer not null default 0,
  status        text not null default 'draft'
                  check (status in ('draft', 'published')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists sections_course_id_order_idx
  on public.sections (course_id, order_number);

create index if not exists sections_status_idx on public.sections (status);

-- -----------------------------------------------------------------------
-- 6. lessons  (references sections)
-- -----------------------------------------------------------------------
create table if not exists public.lessons (
  id              uuid primary key default gen_random_uuid(),
  section_id      uuid not null references public.sections(id) on delete cascade,
  title           text not null,
  description     text,
  pdf_url         text,
  video_id        text,
  allow_download  boolean not null default false,
  page_count      integer,
  lesson_order    integer not null default 0,
  status          text not null default 'draft'
                    check (status in ('draft', 'published')),
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists lessons_section_id_order_idx
  on public.lessons (section_id, lesson_order);

create index if not exists lessons_status_idx on public.lessons (status);

-- -----------------------------------------------------------------------
-- 7. payments  (references users, courses)
--    NOTE: invoice_id FK is added in step 9 after invoices table exists.
-- -----------------------------------------------------------------------
create table if not exists public.payments (
  id                   uuid primary key default gen_random_uuid(),
  student_id           uuid not null references public.users(id),
  course_id            uuid not null references public.courses(id),
  razorpay_order_id    text unique,
  razorpay_payment_id  text unique,
  invoice_id           uuid,
  payment_status       text not null default 'pending'
                         check (payment_status in ('pending', 'success', 'failed', 'refunded')),
  amount_paid          numeric(10, 2) not null,
  currency             text not null default 'INR',
  gst_state            text,
  method               text,
  raw_payload          jsonb,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists payments_student_id_idx
  on public.payments (student_id);

create index if not exists payments_razorpay_order_id_idx
  on public.payments (razorpay_order_id);

-- -----------------------------------------------------------------------
-- 8. course_access  (references users, courses, payments)
-- -----------------------------------------------------------------------
create table if not exists public.course_access (
  id             uuid primary key default gen_random_uuid(),
  student_id     uuid not null references public.users(id),
  course_id      uuid not null references public.courses(id),
  payment_id     uuid references public.payments(id),
  access_status  text not null default 'active'
                   check (access_status in ('active', 'revoked', 'expired')),
  granted_at     timestamptz not null default now(),
  revoked_at     timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- One active entitlement per student per course enforced at the DB level.
create unique index if not exists course_access_active_unique_idx
  on public.course_access (student_id, course_id)
  where access_status = 'active';

create index if not exists course_access_student_id_idx
  on public.course_access (student_id);

-- -----------------------------------------------------------------------
-- 9. invoices  (references payments)
-- -----------------------------------------------------------------------
create table if not exists public.invoices (
  id                    uuid primary key default gen_random_uuid(),
  payment_id            uuid not null unique references public.payments(id),
  invoice_number        text not null unique,
  invoice_date          timestamptz not null default now(),
  invoice_status        text not null default 'generated'
                          check (invoice_status in ('pending', 'generated')),
  invoice_download_url  text,
  seller_name           text,
  seller_gstin          text,
  buyer_state           text,
  place_of_supply       text,
  sac_code              text,
  tax_type              text check (tax_type in ('cgst_sgst', 'igst')),
  base_amount           numeric(10, 2) not null,
  gst_amount            numeric(10, 2) not null,
  gst_rate              numeric(5, 4) not null,
  cgst                  numeric(10, 2) not null default 0.00,
  sgst                  numeric(10, 2) not null default 0.00,
  igst                  numeric(10, 2) not null default 0.00,
  total_amount          numeric(10, 2) not null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Add the FK from payments.invoice_id now that invoices table exists.
alter table public.payments
  drop constraint if exists payments_invoice_id_fkey;

alter table public.payments
  add constraint payments_invoice_id_fkey
  foreign key (invoice_id) references public.invoices(id);

-- -----------------------------------------------------------------------
-- 10. progress  (references users, lessons)
-- -----------------------------------------------------------------------
create table if not exists public.progress (
  id                       uuid primary key default gen_random_uuid(),
  student_id               uuid not null references public.users(id) on delete cascade,
  lesson_id                uuid not null references public.lessons(id) on delete cascade,
  video_progress_seconds   integer not null default 0,
  document_progress_page   integer not null default 0,
  completed                boolean not null default false,
  completed_at             timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),

  constraint progress_student_lesson_unique unique (student_id, lesson_id)
);

create index if not exists progress_student_id_idx on public.progress (student_id);
create index if not exists progress_lesson_id_idx  on public.progress (lesson_id);

-- -----------------------------------------------------------------------
-- 11. email_log  (references users)
-- -----------------------------------------------------------------------
create table if not exists public.email_log (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references public.users(id) on delete set null,
  template            text not null,
  to_address          text not null,
  subject             text,
  status              text not null default 'pending'
                        check (status in ('pending', 'sent', 'failed', 'delivered')),
  provider_message_id text,
  error               text,
  metadata            jsonb,
  sent_at             timestamptz,
  created_at          timestamptz not null default now()
);

create index if not exists email_log_user_id_idx on public.email_log (user_id);
create index if not exists email_log_status_idx on public.email_log (status);

-- =======================================================================
-- Row Level Security
-- All repository calls use the SERVICE ROLE key which bypasses RLS.
-- Enable RLS on all tables so the anon key cannot read raw data if ever
-- accidentally exposed.
-- =======================================================================
alter table public.users         enable row level security;
alter table public.sessions      enable row level security;
alter table public.courses       enable row level security;
alter table public.leads         enable row level security;
alter table public.sections      enable row level security;
alter table public.lessons       enable row level security;
alter table public.payments      enable row level security;
alter table public.course_access enable row level security;
alter table public.invoices      enable row level security;
alter table public.progress      enable row level security;
alter table public.email_log     enable row level security;
