-- =====================================================================
-- ANIKOD — Bölüm 4: Sipariş Durumu State Machine
-- Supabase SQL Editor'da tek seferde çalıştırılabilir. İdempotent'tir.
--
-- Gerçek akış (koddaki mevcut kullanımlara göre):
--   pending  -> sipariş oluşturuldu, ödeme bekleniyor (dashboard/actions.ts createOrder)
--   paid     -> ödeme onaylandı (api/payment/callback/route.ts)
--   in_production -> üretici üretime aldı
--   shipped  -> kargoya verildi
--   completed-> teslim edildi / tamamlandı
--   cancelled-> iptal edildi (shipped/completed'a ulaşmadan önce)
--
-- ÖNEMLİ: Bu migration'ı çalıştırmadan önce mevcut verinizde bu 6 değer
-- dışında bir `orders.status` değeri olmadığını doğrulayın:
--   select distinct status from public.orders;
-- Farklı bir değer çıkarsa CHECK constraint eklemeden önce bana bildirin.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) orders.status için sabit değer kümesi (CHECK constraint)
-- ---------------------------------------------------------------------
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders
  add constraint orders_status_check
  check (status in ('pending', 'paid', 'in_production', 'shipped', 'completed', 'cancelled'));

-- ---------------------------------------------------------------------
-- 2) GEÇİŞ DOĞRULAMA TRIGGER'I
-- Sadece ardışık/mantıklı geçişlere izin verir ve geçişi kimin
-- yapabileceğini rol bazında sınırlar. `orders` tablosuna yapılan HER
-- status güncellemesinde çalışır — ister RPC üzerinden ister doğrudan
-- .update() ile yapılsın, atlatılamaz.
-- ---------------------------------------------------------------------
create or replace function public.enforce_order_status_transition()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.user_role;
begin
  -- status değişmiyorsa (ör. sadece tracking_number güncelleniyor) serbest bırak.
  if new.status = old.status then
    return new;
  end if;

  -- Sadece tanımlı, ardışık geçişlere izin ver.
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
    -- Ödeme onayını sipariş sahibi müşteri (checkout callback'i) ya da
    -- producer/admin (manuel/nakit ödeme onayı) tetikleyebilir.
    if not (old.customer_id = auth.uid() or v_role in ('producer', 'admin')) then
      raise exception 'Bu durum güncellemesi için yetkiniz yok.' using errcode = '42501';
    end if;
  else
    -- Üretim / kargo / tamamlama / iptal: yalnızca producer veya admin.
    if v_role is null or v_role not in ('producer', 'admin') then
      raise exception 'Bu durum güncellemesi için üretici veya admin yetkisi gereklidir.'
        using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_order_status_transition on public.orders;
create trigger trg_enforce_order_status_transition
  before update of status on public.orders
  for each row execute function public.enforce_order_status_transition();

-- ---------------------------------------------------------------------
-- 3) RLS: müşterinin kendi siparişinde ödeme onayını (pending -> paid)
-- işleyebilmesi için bir UPDATE politikası gerekiyor. Satır erişimini
-- RLS, geçişin GEÇERLİLİĞİNİ ve KİMİN yapabileceğini yukarıdaki trigger
-- belirliyor — customer bu politika sayesinde satıra erişebilse bile
-- trigger, pending->paid dışındaki her denemesini reddeder.
-- ---------------------------------------------------------------------
drop policy if exists "orders: customer update own" on public.orders;
create policy "orders: customer update own"
on public.orders for update
to authenticated
using (customer_id = auth.uid())
with check (customer_id = auth.uid());

-- ---------------------------------------------------------------------
-- 4) advance_order_status RPC — server action'ın çağıracağı tek giriş noktası.
-- SECURITY INVOKER (varsayılan): RLS ve yukarıdaki trigger çağıranın
-- kimliğiyle çalışır, yetki bypass edilmez.
-- ---------------------------------------------------------------------
create or replace function public.advance_order_status(
  p_order_id uuid,
  p_new_status text,
  p_tracking_number text default null
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
