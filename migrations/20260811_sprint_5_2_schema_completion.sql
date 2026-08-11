-- =======================================================================
-- NYTRC LMS — Migration Script: Sprint 5.2 Database Schema Completion
-- Run this script in the Supabase SQL Editor to update an existing database.
-- =======================================================================

-- 1. USERS: Add mobile, state, last_login_at
alter table public.users
  add column if not exists mobile text,
  add column if not exists state text,
  add column if not exists last_login_at timestamptz;

-- 2. LEADS: Create leads table for guest checkout capture
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
alter table public.leads enable row level security;

-- 3. EMAIL_LOG: Create email_log table for delivery tracking and retries
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
alter table public.email_log enable row level security;

-- 4. COURSES: Add price column
alter table public.courses
  add column if not exists price numeric(10, 2) not null default 0.00;

-- 5. SECTIONS: Add status column & index
alter table public.sections
  add column if not exists status text not null default 'draft'
    check (status in ('draft', 'published'));

create index if not exists sections_status_idx on public.sections (status);

-- 6. LESSONS: Add published_at column
alter table public.lessons
  add column if not exists published_at timestamptz;

-- 7. PAYMENTS: Add method, raw_payload, update payment_status constraint
alter table public.payments
  add column if not exists method text,
  add column if not exists raw_payload jsonb;

alter table public.payments
  drop constraint if exists payments_payment_status_check;

alter table public.payments
  add constraint payments_payment_status_check
    check (payment_status in ('pending', 'success', 'failed', 'refunded'));

-- 8. INVOICES: Add GST invoice metadata fields
alter table public.invoices
  add column if not exists invoice_date timestamptz not null default now(),
  add column if not exists seller_name text,
  add column if not exists seller_gstin text,
  add column if not exists buyer_state text,
  add column if not exists place_of_supply text,
  add column if not exists sac_code text,
  add column if not exists tax_type text check (tax_type in ('cgst_sgst', 'igst')),
  add column if not exists cgst numeric(10, 2) not null default 0.00,
  add column if not exists sgst numeric(10, 2) not null default 0.00,
  add column if not exists igst numeric(10, 2) not null default 0.00;
