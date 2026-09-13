-- ANIKOD temel Supabase semasi.
-- 002, 003 ve 004 migration'larindan once calistirilmalidir.

create extension if not exists pgcrypto;

do $$ begin
  create type public.user_role as enum ('customer', 'producer', 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.memorial_visibility as enum ('family_only', 'public');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.memorial_status as enum ('draft', 'active', 'archived');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.memory_type as enum ('photo', 'video', 'text_memory');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.memory_visibility as enum ('inherit', 'family_only');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.member_role as enum ('family_admin', 'family_member');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.member_status as enum ('invited', 'accepted', 'revoked');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.plaque_type as enum ('standard', 'premium', 'custom');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.payment_status as enum ('pending', 'paid', 'refunded', 'failed');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.order_status as enum (
    'draft', 'payment_pending', 'paid', 'qr_generated', 'production_queued',
    'in_production', 'produced', 'shipped', 'delivered'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.qr_issue_reason as enum ('initial_order', 'replacement');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default 'Yeni Kullanici',
  phone text,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now()
);

create table if not exists public.memorials (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  birth_date date,
  death_date date,
  biography text,
  cover_photo_url text,
  visibility public.memorial_visibility not null default 'public',
  status public.memorial_status not null default 'active',
  slug text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid not null references public.memorials(id) on delete cascade,
  uploaded_by uuid references auth.users(id) on delete set null,
  type public.memory_type not null,
  content_url text,
  caption text,
  visibility_override public.memory_visibility not null default 'inherit',
  is_approved boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.memorial_members (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid not null references public.memorials(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  invited_email text not null,
  role public.member_role not null default 'family_member',
  status public.member_status not null default 'invited',
  invited_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('ORD-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  customer_id uuid not null references auth.users(id) on delete restrict,
  memorial_id uuid not null references public.memorials(id) on delete restrict,
  plaque_type public.plaque_type not null,
  recipient_full_name text not null,
  shipping_address jsonb not null default '{}'::jsonb,
  payment_status public.payment_status not null default 'pending',
  status public.order_status not null default 'draft',
  iyzico_payment_id text,
  iyzico_conversation_id text,
  iyzico_raw_response jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  from_status public.order_status,
  to_status public.order_status not null,
  changed_by uuid references auth.users(id) on delete set null,
  changed_at timestamptz not null default now()
);

create table if not exists public.qr_codes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  memorial_id uuid not null references public.memorials(id) on delete cascade,
  is_active boolean not null default true,
  issue_reason public.qr_issue_reason not null default 'initial_order',
  created_at timestamptz not null default now()
);

create index if not exists memorials_owner_id_idx on public.memorials(owner_id);
create index if not exists memorials_slug_idx on public.memorials(slug);
create index if not exists memories_memorial_id_idx on public.memories(memorial_id);
create index if not exists orders_customer_id_idx on public.orders(customer_id);
create index if not exists orders_status_idx on public.orders(status);

create or replace view public.public_memorial_view as
select id, full_name, birth_date, death_date, biography, cover_photo_url, slug
from public.memorials
where visibility = 'public' and status = 'active';

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_producer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('producer', 'admin')
  );
$$;

create or replace function public.get_producer_queue()
returns table (
  order_id uuid,
  order_number text,
  recipient_full_name text,
  plaque_type public.plaque_type,
  shipping_address jsonb,
  status public.order_status,
  qr_code_id uuid
)
language sql
stable
security definer
set search_path = public
as $$
  select
    o.id,
    o.order_number,
    o.recipient_full_name,
    o.plaque_type,
    o.shipping_address,
    o.status,
    q.id
  from public.orders o
  left join public.qr_codes q on q.order_id = o.id and q.is_active = true
  where public.is_producer()
    and o.status in ('production_queued', 'in_production')
  order by o.created_at asc;
$$;

create or replace function public.advance_order_status(
  p_order_id uuid,
  p_new_status public.order_status
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_status public.order_status;
begin
  if not public.is_producer() then
    raise exception 'Yetkisiz siparis durum degisikligi';
  end if;

  select status into current_status
  from public.orders
  where id = p_order_id
  for update;

  if current_status is null then
    raise exception 'Siparis bulunamadi';
  end if;

  update public.orders
  set status = p_new_status, updated_at = now()
  where id = p_order_id;

  insert into public.order_status_history (order_id, from_status, to_status, changed_by)
  values (p_order_id, current_status, p_new_status, auth.uid());
end;
$$;

alter table public.memorials enable row level security;
alter table public.memories enable row level security;
alter table public.memorial_members enable row level security;
alter table public.orders enable row level security;
alter table public.order_status_history enable row level security;
alter table public.qr_codes enable row level security;

-- Siparis sahibi kendi siparislerini gorebilir ve olusturabilir.
drop policy if exists "orders: customer read own" on public.orders;
create policy "orders: customer read own"
on public.orders for select to authenticated
using (customer_id = auth.uid() or public.is_admin());

drop policy if exists "orders: customer insert own" on public.orders;
create policy "orders: customer insert own"
on public.orders for insert to authenticated
with check (customer_id = auth.uid());

-- Admin tum siparisleri gorebilir; durum guncellemesi RPC uzerinden yapilir.
drop policy if exists "orders: admin update" on public.orders;
create policy "orders: admin update"
on public.orders for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "orders: admin history read" on public.order_status_history;
create policy "orders: admin history read"
on public.order_status_history for select to authenticated
using (public.is_admin() or exists (
  select 1 from public.orders o
  where o.id = order_id and o.customer_id = auth.uid()
));

drop policy if exists "qr_codes: admin read" on public.qr_codes;
create policy "qr_codes: admin read"
on public.qr_codes for select to authenticated
using (public.is_admin() or exists (
  select 1 from public.orders o
  where o.id = order_id and o.customer_id = auth.uid()
));
