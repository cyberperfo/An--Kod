-- =====================================================================
-- ANIKOD — Bölüm 8: Ödeme Callback'i için service_role İzni
-- Supabase SQL Editor'da tek seferde çalıştırılabilir. İdempotent'tir.
--
-- SORUN: /api/payment/callback rotası Iyzico'nun (veya mock sağlayıcının)
-- sunucudan sunucuya bildirdiği bir sonucu işler — bu istek müşterinin
-- oturum çerezini TAŞIMAZ (gerçek Iyzico akışında istek Iyzico'nun kendi
-- sunucularından gelir). Bu yüzden callback artık admin/service-role
-- istemcisiyle (lib/supabase/admin.ts) çalışıyor ve auth.uid() bu context'te
-- her zaman NULL. 004'teki enforce_order_status_transition trigger'ı
-- pending -> paid geçişini sadece "old.customer_id = auth.uid() veya
-- producer/admin" ise kabul ediyordu — service-role çağrılarını
-- reddederdi. Bu migration, doğrulanmış sunucu-sunucu ödeme
-- onaylarına da izin veriyor.
-- =====================================================================

create or replace function public.enforce_order_status_transition()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.user_role;
begin
  if new.status = old.status then
    return new;
  end if;

  if not (
    (old.status = 'pending'       and new.status in ('paid', 'cancelled')) or
    (old.status = 'paid'          and new.status in ('in_production', 'cancelled')) or
    (old.status = 'in_production' and new.status in ('shipped', 'cancelled')) or
    (old.status = 'shipped'       and new.status = 'completed')
  ) then
    raise exception 'Geçersiz sipariş durumu geçişi: % -> %', old.status, new.status
      using errcode = '22023';
  end if;

  select role into v_role from public.profiles where id = auth.uid();

  if new.status = 'paid' then
    -- Ödeme onayı: sipariş sahibi müşteri, producer/admin, ya da doğrulanmış
    -- sunucu-sunucu ödeme callback'i (service_role) tetikleyebilir.
    if not (
      old.customer_id = auth.uid()
      or v_role in ('producer', 'admin')
      or auth.role() = 'service_role'
    ) then
      raise exception 'Bu durum güncellemesi için yetkiniz yok.' using errcode = '42501';
    end if;
  else
    if v_role is null or v_role not in ('producer', 'admin') then
      raise exception 'Bu durum güncellemesi için üretici veya admin yetkisi gereklidir.'
        using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;

-- =====================================================================
-- SONU
-- =====================================================================
