-- =====================================================================
-- ANIKOD — Bölüm 6: Signed URL Medya + Aile Üyeliği Kabul Akışı
-- Supabase SQL Editor'da tek seferde çalıştırılabilir. İdempotent'tir.
--
-- BİLİNEN SINIR: Bugüne kadar yüklenen fotoğraflar `userId/dosya.ext`
-- yolunda (memorial_id İÇERMİYOR). Bu migration'dan sonra yeni
-- yüklemeler `userId/memorialId/dosya.ext` yoluna gidecek ve RLS bunu
-- kullanarak "bu fotoğraf hangi anıya ait, o anı bu kullanıcıya görünür
-- mü" diye kontrol edecek. ESKİ fotoğraflar bu bilgiyi taşımadığı için
-- yeni SELECT politikasıyla eşleşmez; sadece sahibi/producer/admin
-- görebilir hale gelir (aşağıdaki "owner select" politikası sayesinde).
-- Ziyaretçilere tekrar göstermek için ilgili anı düzenlenip fotoğraf
-- yeniden yüklenmeli — bu, ham SQL ile otomatik taşınamaz (Storage API
-- gerektirir).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) memorials.cover_photo_path — gerçek storage yolu (signed URL üretmek için).
-- Eski cover_photo_url (tam public URL) korunuyor, silinmiyor; sadece
-- artık kullanılmıyor. Mevcut public URL'lerden path'i best-effort çıkarıyoruz.
-- ---------------------------------------------------------------------
alter table public.memorials add column if not exists cover_photo_path text;

update public.memorials
set cover_photo_path = regexp_replace(cover_photo_url, '^.*/storage/v1/object/public/memorial-photos/', '')
where cover_photo_url is not null
  and cover_photo_path is null
  and cover_photo_url like '%/storage/v1/object/public/memorial-photos/%';

-- ---------------------------------------------------------------------
-- 2) BUCKET'I PRIVATE YAP
-- ---------------------------------------------------------------------
update storage.buckets set public = false where id = 'memorial-photos';

-- ---------------------------------------------------------------------
-- 3) STORAGE RLS — 002'deki blanket "herkes okuyabilir" politikasının yerine
-- gizlilik seviyesine duyarlı politika seti.
-- ---------------------------------------------------------------------
drop policy if exists "memorial-photos: public read" on storage.objects;
drop policy if exists "memorial-photos: owner insert" on storage.objects;
drop policy if exists "memorial-photos: owner update" on storage.objects;
drop policy if exists "memorial-photos: owner delete" on storage.objects;
drop policy if exists "memorial-photos: owner select" on storage.objects;
drop policy if exists "memorial-photos: staff select" on storage.objects;
drop policy if exists "memorial-photos: visible memorial select" on storage.objects;

-- Yükleme: sadece kendi klasörüne VE gerçekten sahibi olduğu bir anıya.
create policy "memorial-photos: owner insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'memorial-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
  and exists (
    select 1 from public.memorials m
    where m.id::text = (storage.foldername(name))[2]
      and m.owner_id = auth.uid()
  )
);

create policy "memorial-photos: owner update"
on storage.objects for update
to authenticated
using (bucket_id = 'memorial-photos' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'memorial-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "memorial-photos: owner delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'memorial-photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- Okuma: sahibi her zaman görür.
create policy "memorial-photos: owner select"
on storage.objects for select
to authenticated
using (bucket_id = 'memorial-photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- Okuma: producer/admin her zaman görür (üretim için gerekli).
create policy "memorial-photos: staff select"
on storage.objects for select
to authenticated
using (bucket_id = 'memorial-photos' and public.is_producer_or_admin());

-- Okuma: anonim dahil, ait olduğu anı görünürse (public / üye ise family_only) görünür.
create policy "memorial-photos: visible memorial select"
on storage.objects for select
using (
  bucket_id = 'memorial-photos'
  and exists (
    select 1 from public.memorials m
    where m.id::text = (storage.foldername(name))[2]
      and public.can_view_memorial(m.id, m.owner_id, m.visibility)
  )
);

-- ---------------------------------------------------------------------
-- 4) MEMORIAL_MEMBERS — davetin sahibi tarafından e-postayla eşleşen
-- kullanıcının KENDİ davetini kabul edebilmesi için politika.
-- Sadece invited -> accepted geçişine ve user_id'yi kendine bağlamaya
-- izin verir; başka bir alanı ya da başkasının davetini değiştiremez.
-- ---------------------------------------------------------------------
drop policy if exists "memorial_members: accept own invite" on public.memorial_members;
create policy "memorial_members: accept own invite"
on public.memorial_members for update
to authenticated
using (invited_email = (auth.jwt() ->> 'email') and status = 'invited')
with check (user_id = auth.uid() and status = 'accepted');

-- =====================================================================
-- SONU
-- =====================================================================
