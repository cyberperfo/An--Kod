-- =====================================================================
-- ANIKOD — Bölüm 9: Destek Merkezi İletişim Formu
-- Supabase SQL Editor'da tek seferde çalıştırılabilir. İdempotent'tir.
-- =====================================================================

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now()
);

alter table public.support_messages enable row level security;

drop policy if exists "support_messages: insert own" on public.support_messages;
create policy "support_messages: insert own"
on public.support_messages for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "support_messages: select own" on public.support_messages;
create policy "support_messages: select own"
on public.support_messages for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "support_messages: admin update" on public.support_messages;
create policy "support_messages: admin update"
on public.support_messages for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- =====================================================================
-- SONU
-- =====================================================================
