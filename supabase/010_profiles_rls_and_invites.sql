-- =====================================================================
-- ANIKOD — Bölüm 10: profiles RLS + Hesap/Davet UI için destek
-- Supabase SQL Editor'da tek seferde çalıştırılabilir. İdempotent'tir.
--
-- KRİTİK GÜVENLİK DÜZELTMESİ: `public.profiles` tablosunda şimdiye kadar
-- HİÇ RLS politikası yoktu. RLS enable edilmemiş bir tabloda authenticated
-- rolüne Supabase'in varsayılan proje kurulumunda verilen blanket
-- GRANT'lar geçerli olur — yani herhangi bir kullanıcı, kendi `role`
-- alanı dahil, `profiles` tablosundaki HERHANGİ bir satırı
-- güncelleyebilirdi (ör. kendini 'admin' yapabilirdi). Bu, tüm RBAC
-- sisteminin (003/004/005/006 migration'ları) dayandığı tek alanı
-- (profiles.role) korumasız bırakıyordu.
--
-- Düzeltme iki katmanlı:
--   1) RLS: kullanıcı sadece kendi satırını görüp güncelleyebilir.
--   2) Kolon seviyesi GRANT: authenticated rolü `role` kolonuna asla
--      UPDATE yapamaz (RLS satır erişimine izin verse bile) — sadece
--      full_name ve phone güncellenebilir.
-- =====================================================================

alter table public.profiles enable row level security;

drop policy if exists "profiles: select own" on public.profiles;
create policy "profiles: select own"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "profiles: admin all" on public.profiles;
create policy "profiles: admin all"
on public.profiles for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Kolon seviyesi kısıtlama: role/id/created_at hiçbir zaman authenticated
-- tarafından (RLS'i geçse bile) UPDATE edilemez.
revoke update on public.profiles from authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

-- =====================================================================
-- SONU
-- =====================================================================
