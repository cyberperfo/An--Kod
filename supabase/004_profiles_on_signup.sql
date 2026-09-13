-- Auth kullanıcısı oluşturulduğunda uygulama profilini de oluşturur.
-- E-posta doğrulaması açıkken signUp session döndürmese bile trigger çalışır.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 'Yeni Kullanıcı')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;

drop policy if exists "profiles: own read" on public.profiles;
create policy "profiles: own read"
on public.profiles for select
to authenticated
using (auth.uid() = id);

-- Migration çalıştırılmadan önce kayıt olmuş kullanıcıları da tamamla.
insert into public.profiles (id, full_name)
select
  id,
  coalesce(nullif(trim(raw_user_meta_data ->> 'full_name'), ''), 'Yeni Kullanıcı')
from auth.users
on conflict (id) do nothing;