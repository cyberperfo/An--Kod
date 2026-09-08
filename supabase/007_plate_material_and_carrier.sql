-- =====================================================================
-- ANIKOD — Bölüm 7: Plaka Materyali + Kargo Firması
-- Supabase SQL Editor'da tek seferde çalıştırılabilir. İdempotent'tir.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) orders.plate_material — fiziksel plaka materyali/rengi.
-- ---------------------------------------------------------------------
alter table public.orders drop constraint if exists orders_plate_material_check;
alter table public.orders add column if not exists plate_material text default 'stainless_steel';
alter table public.orders
  add constraint orders_plate_material_check
  check (plate_material in ('stainless_steel', 'marble_finish', 'matte_black', 'classic_gold'));

-- ---------------------------------------------------------------------
-- 2) orders.carrier — kargo firması (serbest metin; sabit bir firma
-- listesine bağlamak istenirse ileride enum'a çevrilebilir).
-- ---------------------------------------------------------------------
alter table public.orders add column if not exists carrier text;

-- ---------------------------------------------------------------------
-- 3) advance_order_status fonksiyonuna carrier parametresi ekleniyor.
-- İmza değiştiği için önce eskisini düşürüyoruz.
-- ---------------------------------------------------------------------
drop function if exists public.advance_order_status(uuid, text, text);

create or replace function public.advance_order_status(
  p_order_id uuid,
  p_new_status text,
  p_tracking_number text default null,
  p_carrier text default null
)
returns public.orders
language plpgsql
as $$
declare
  v_order public.orders;
begin
  update public.orders
  set
    status = p_new_status,
    tracking_number = coalesce(p_tracking_number, tracking_number),
    carrier = coalesce(p_carrier, carrier),
    updated_at = now()
  where id = p_order_id
  returning * into v_order;

  if v_order.id is null then
    raise exception 'Sipariş bulunamadı ya da bu işlem için yetkiniz yok.'
      using errcode = '42501';
  end if;

  return v_order;
end;
$$;

-- =====================================================================
-- SONU
-- =====================================================================
