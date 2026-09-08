-- =====================================================================
-- ANIKOD — Bölüm 5: Üç Katmanlı Gizlilik (public / family_only / private)
-- Supabase SQL Editor'da tek seferde çalıştırılabilir. İdempotent'tir.
--
-- ÖNEMLİ SINIR: memorial-photos storage bucket'ı public kalmaya devam
-- ediyor (002 migration). Yani bir anı sayfası "private" yapılsa bile,
-- fotoğrafın ham storage URL'ini elinde bulunduran biri o görseli yine
-- açabilir. Gerçek dosya seviyesinde gizlilik için bucket'ı private'a
-- çevirip imzalı URL (signed URL) üretimine geçmek gerekir — bu, foto
-- gösteren tüm ekranları (MemorialCard, EditMemorialForm, /m/[slug],
-- baskı şablonu) etkileyen ayrı ve daha büyük bir değişiklik olduğu için
-- bilinçli olarak bu migration'ın kapsamı dışında bırakıldı. Bu migration
-- SAYFA/İÇERİK erişimini (kim hangi anıyı/mesajı görebilir) güvenceye alır.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) memorial_visibility enum'unu 3. seviyeye genişlet
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'memorial_visibility') then
    create type public.memorial_visibility as enum ('public', 'family_only', 'private');
  else
    if not exists (
      select 1 from pg_enum
      where enumtypid = 'public.memorial_visibility'::regtype
        and enumlabel = 'private'
    ) then
      alter type public.memorial_visibility add value 'private';
    end if;
  end if;
end $$;

alter table public.memorials
  add column if not exists visibility public.memorial_visibility not null default 'public';

-- ---------------------------------------------------------------------
-- 2) ÜYELİK KONTROLÜ
-- family_only içerik için "aile üyesi" tanımı memorial_members tablosundaki
-- kabul edilmiş (accepted) davetlerdir. Davet gönderme/kabul etme akışı
-- bu migration'ın kapsamında değil — tablo zaten şemada mevcut, RLS burada
-- sadece var olan satırları okuma yetkisi için kullanılıyor.
-- ---------------------------------------------------------------------
create or replace function public.is_memorial_member(p_memorial_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.memorial_members
    where memorial_id = p_memorial_id
      and user_id = auth.uid()
      and status = 'accepted'
  );
$$;

create or replace function public.can_view_memorial(p_memorial_id uuid, p_owner_id uuid, p_visibility public.memorial_visibility)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    p_visibility = 'public'
    or p_owner_id = auth.uid()
    or public.is_producer_or_admin()
    or (p_visibility = 'family_only' and public.is_memorial_member(p_memorial_id));
$$;

-- ---------------------------------------------------------------------
-- 3) MEMORIALS RLS — 002'deki "herkese açık" SELECT politikası yerine
-- gizlilik seviyesine duyarlı politika.
-- ---------------------------------------------------------------------
drop policy if exists "memorials: public read" on public.memorials;
drop policy if exists "memorials: visibility read" on public.memorials;
create policy "memorials: visibility read"
on public.memorials for select
using (public.can_view_memorial(id, owner_id, visibility));

-- (owner insert/update/delete ve admin all politikaları 002/003'ten
-- değişmeden korunuyor.)

-- ---------------------------------------------------------------------
-- 4) MEMORIAL_MEMBERS RLS — şimdiye kadar hiç RLS yoktu.
-- ---------------------------------------------------------------------
alter table public.memorial_members enable row level security;

drop policy if exists "memorial_members: owner manage" on public.memorial_members;
create policy "memorial_members: owner manage"
on public.memorial_members for all
to authenticated
using (
  exists (
    select 1 from public.memorials m
    where m.id = memorial_id and m.owner_id = auth.uid()
  )
  or public.is_admin()
)
with check (
  exists (
    select 1 from public.memorials m
    where m.id = memorial_id and m.owner_id = auth.uid()
  )
  or public.is_admin()
);

drop policy if exists "memorial_members: self read" on public.memorial_members;
create policy "memorial_members: self read"
on public.memorial_members for select
to authenticated
using (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- 5) MEMORIES (ziyaretçi defteri / medya) RLS — şimdiye kadar hiç RLS yoktu,
-- yani teorik olarak herkes her mesajı okuyabiliyor/silebiliyordu. Artık
-- ait olduğu anının gizlilik seviyesine ve kendi visibility_override'ına
-- bağlı.
-- ---------------------------------------------------------------------
alter table public.memories enable row level security;

drop policy if exists "memories: read by memorial visibility" on public.memories;
create policy "memories: read by memorial visibility"
on public.memories for select
using (
  exists (
    select 1 from public.memorials m
    where m.id = memorial_id
      and public.can_view_memorial(m.id, m.owner_id, m.visibility)
      and (
        visibility_override = 'inherit'
        or m.owner_id = auth.uid()
        or public.is_producer_or_admin()
        or public.is_memorial_member(m.id)
      )
  )
);

-- Ziyaretçi defterine mesaj bırakma: sadece PUBLIC anılarda anonim/giriş
-- yapmış herkes yazabilir. family_only/private anılarda sadece sahibi,
-- üyeler veya producer/admin yazabilir.
drop policy if exists "memories: insert if memorial visible" on public.memories;
create policy "memories: insert if memorial visible"
on public.memories for insert
with check (
  exists (
    select 1 from public.memorials m
    where m.id = memorial_id
      and (
        m.visibility = 'public'
        or m.owner_id = auth.uid()
        or public.is_producer_or_admin()
        or (m.visibility = 'family_only' and public.is_memorial_member(m.id))
      )
  )
);

drop policy if exists "memories: owner delete" on public.memories;
create policy "memories: owner delete"
on public.memories for delete
to authenticated
using (
  exists (
    select 1 from public.memorials m
    where m.id = memorial_id and m.owner_id = auth.uid()
  )
  or public.is_admin()
);

-- ---------------------------------------------------------------------
-- 6) MASKELEME: RLS bir satırı gizlediğinde "yok" ile "var ama gizli"
-- ayrımını, İÇERİĞİ SIZDIRMADAN, sadece bir durum kodu olarak dönen
-- SECURITY DEFINER fonksiyon. /m/[slug] sayfası bunu kullanıcıya
-- "içerik bulunamadı" yerine "bu içerik gizli tutuluyor" mesajı
-- gösterebilmek için çağırır.
-- ---------------------------------------------------------------------
create or replace function public.memorial_access_state(p_slug text)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_owner_id uuid;
  v_visibility public.memorial_visibility;
begin
  select id, owner_id, visibility
    into v_id, v_owner_id, v_visibility
    from public.memorials
    where slug = p_slug;

  if v_id is null then
    return 'not_found';
  end if;

  if public.can_view_memorial(v_id, v_owner_id, v_visibility) then
    return 'visible';
  end if;

  return 'restricted';
end;
$$;

-- =====================================================================
-- SONU
-- =====================================================================
