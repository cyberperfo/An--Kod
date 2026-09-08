-- =====================================================================
-- ANIKOD — Bölüm 3: RBAC (Rol Tabanlı Yetkilendirme) + Üretici Paneli
-- Supabase SQL Editor'da tek seferde çalıştırılabilir. İdempotent'tir.
--
-- NOT: types/database.types.ts dosyasında `user_role` enum'u ve
-- `is_admin/is_producer/get_producer_queue/advance_order_status`
-- fonksiyonları zaten TANIMLI görünüyor, ancak bunları oluşturan bir
-- SQL migration repoda yoktu (sadece 002 dosyası mevcuttu). Bu dosya
-- o eksik altyapıyı, mevcut şemayla (owner_id, customer_id vb. gerçek
-- kolon adları) birebir uyumlu şekilde kurar. Zaten varsa hata vermez.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) ROL ENUM'U VE profiles.role KOLONU
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('customer', 'producer', 'admin');
  end if;
end $$;

alter table public.profiles
  add column if not exists role public.user_role not null default 'customer';

-- ---------------------------------------------------------------------
-- 2) YENİ KULLANICI KAYDINDA OTOMATİK profiles SATIRI (varsayılan: customer)
-- auth.users'a INSERT olduğunda tetiklenir; signUp() sırasında
-- options.data.full_name olarak gönderilen değeri kullanır.
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 3) ROL KONTROL FONKSİYONLARI
-- security definer + sabit search_path: RLS politikaları içinden
-- güvenle çağrılabilir, profiles tablosuna sonsuz RLS döngüsü yaratmaz.
-- ---------------------------------------------------------------------
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
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
    select 1 from public.profiles where id = auth.uid() and role = 'producer'
  );
$$;

create or replace function public.is_producer_or_admin()
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

-- ---------------------------------------------------------------------
-- 4) MEMORIALS RLS — 002'deki sahiplik politikalarına admin tam yetkisi eklenir.
-- Mevcut public read / owner insert-update-delete politikaları korunur.
-- ---------------------------------------------------------------------
drop policy if exists "memorials: admin all" on public.memorials;
create policy "memorials: admin all"
on public.memorials for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ---------------------------------------------------------------------
-- 5) ORDERS RLS
-- Müşteri: sadece kendi siparişini oluşturabilir ve görebilir (customer_id = auth.uid()).
-- Producer/Admin: tüm siparişleri okuyup güncelleyebilir (kargo/üretim durumu).
-- Admin ayrıca oluşturma/silme dahil tam yetkiye sahiptir.
-- ---------------------------------------------------------------------
alter table public.orders enable row level security;

drop policy if exists "orders: customer select own" on public.orders;
create policy "orders: customer select own"
on public.orders for select
to authenticated
using (customer_id = auth.uid());

drop policy if exists "orders: customer insert own" on public.orders;
create policy "orders: customer insert own"
on public.orders for insert
to authenticated
with check (customer_id = auth.uid());

drop policy if exists "orders: staff select all" on public.orders;
create policy "orders: staff select all"
on public.orders for select
to authenticated
using (public.is_producer_or_admin());

drop policy if exists "orders: staff update all" on public.orders;
create policy "orders: staff update all"
on public.orders for update
to authenticated
using (public.is_producer_or_admin())
with check (public.is_producer_or_admin());

drop policy if exists "orders: admin all" on public.orders;
create policy "orders: admin all"
on public.orders for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- =====================================================================
-- SONU
-- =====================================================================
