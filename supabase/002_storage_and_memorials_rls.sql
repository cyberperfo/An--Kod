-- =====================================================================
-- ANIKOD — Bölüm 1: Storage Bucket + memorials RLS
-- Supabase SQL Editor'da tek seferde çalıştırılabilir. İdempotent'tir
-- (tekrar çalıştırmak hata vermez, mevcut policy'lerin üzerine yazar).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) STORAGE BUCKET: memorial-photos
-- Kod zaten bu bucket adını kullanıyor (`dashboard/new/actions.ts`),
-- burada isim sabit tutuldu.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('memorial-photos', 'memorial-photos', true)
on conflict (id) do nothing;

-- Herkes (anon dahil) görselleri okuyabilsin.
-- Bucket zaten public=true ama RLS seviyesinde de açıkça izin veriyoruz.
drop policy if exists "memorial-photos: public read" on storage.objects;
create policy "memorial-photos: public read"
on storage.objects for select
using (bucket_id = 'memorial-photos');

-- Sadece giriş yapmış kullanıcılar, KENDİ klasörlerine yükleme yapabilsin.
-- Kod dosyaları `${user.id}/${dosyaAdi}` şeklinde yüklüyor (actions.ts),
-- bu yüzden path'in ilk parçası auth.uid() ile eşleşmeli.
drop policy if exists "memorial-photos: owner insert" on storage.objects;
create policy "memorial-photos: owner insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'memorial-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Sadece kendi yüklediği dosyayı güncelleyebilsin.
drop policy if exists "memorial-photos: owner update" on storage.objects;
create policy "memorial-photos: owner update"
on storage.objects for update
to authenticated
using (bucket_id = 'memorial-photos' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'memorial-photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- Sadece kendi yüklediği dosyayı silebilsin.
drop policy if exists "memorial-photos: owner delete" on storage.objects;
create policy "memorial-photos: owner delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'memorial-photos' and (storage.foldername(name))[1] = auth.uid()::text);


-- ---------------------------------------------------------------------
-- 2) MEMORIALS TABLOSU RLS
--
-- ÖNEMLİ DÜZELTME: İstekte "auth.uid() = user_id" yazıyordu, ancak kod
-- tabanı (app/dashboard/page.tsx'teki .eq("owner_id", user.id) sorgusu
-- ve types/database.types.ts) gerçek kolon adının owner_id olduğunu
-- gösteriyor. Politikalar buna göre owner_id üzerinden kuruldu.
--
-- Ayrıca `app/dashboard/new/actions.ts` insert sırasında hem owner_id
-- hem de user_id gönderiyordu — bu Bölüm 2'de owner_id'ye sadeleştirildi.
-- Eğer tablonda gerçekten ayrı bir user_id kolonu varsa ve başka bir
-- amaçla kullanılıyorsa bana bildir, politikaları ona göre güncelleyelim.
-- ---------------------------------------------------------------------

alter table public.memorials enable row level security;

-- Herkes (ziyaretçi dahil) anı sayfalarını görebilsin — public vitrin bunu gerektiriyor.
drop policy if exists "memorials: public read" on public.memorials;
create policy "memorials: public read"
on public.memorials for select
using (true);

-- Sadece giriş yapmış kullanıcı, kendi owner_id'siyle yeni kayıt oluşturabilsin.
drop policy if exists "memorials: owner insert" on public.memorials;
create policy "memorials: owner insert"
on public.memorials for insert
to authenticated
with check (auth.uid() = owner_id);

-- Sadece sayfa sahibi kendi anı sayfasını güncelleyebilsin.
drop policy if exists "memorials: owner update" on public.memorials;
create policy "memorials: owner update"
on public.memorials for update
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

-- Sadece sayfa sahibi kendi anı sayfasını silebilsin.
drop policy if exists "memorials: owner delete" on public.memorials;
create policy "memorials: owner delete"
on public.memorials for delete
to authenticated
using (auth.uid() = owner_id);

-- =====================================================================
-- SONU
-- =====================================================================
