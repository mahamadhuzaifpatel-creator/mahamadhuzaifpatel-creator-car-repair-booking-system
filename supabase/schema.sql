-- =====================================================================
-- CarCare - Car Repair Booking System
-- Database setup for Supabase (PostgreSQL)
--
-- How to run:
--   Supabase dashboard -> SQL Editor -> New query -> paste this whole
--   file -> Run. It should finish with "Success. No rows returned".
--
-- It is safe to run more than once. It never deletes tables or rows:
-- tables that already exist are kept as they are, and the functions and
-- security rules are simply replaced with the ones below.
--
-- How the app uses the database:
--   - Customers do NOT have accounts. They book through the public
--     booking form, which calls the create_guest_booking function.
--   - Only the admin signs in. The admin is a Supabase Auth user whose
--     row in "profiles" has role = 'admin' (see the end of this file).
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. TABLES
-- ---------------------------------------------------------------------

-- People. A customer row is created automatically the first time someone
-- books with a new phone number. The admin also has a row here.
create table if not exists public.profiles (
  id          uuid primary key default gen_random_uuid(),
  full_name   text,
  email       text,
  phone       text,
  role        text not null default 'customer',   -- 'customer' or 'admin'
  created_at  timestamptz not null default now()
);

create table if not exists public.vehicles (
  id                   bigint generated always as identity primary key,
  user_id              uuid not null references public.profiles (id) on delete cascade,
  registration_number  text not null,
  brand                text not null,
  model                text not null,
  year                 integer,
  fuel_type            text,
  created_at           timestamptz not null default now()
);

create table if not exists public.service_centers (
  id            bigint generated always as identity primary key,
  owner_id      uuid references public.profiles (id) on delete set null,
  name          text not null,
  address       text not null,
  phone         text,
  opening_time  time,
  closing_time  time,
  rating        numeric,
  created_at    timestamptz not null default now()
);

-- The repairs a service center offers, for example "Oil change".
create table if not exists public.services (
  id                 bigint generated always as identity primary key,
  service_center_id  bigint references public.service_centers (id) on delete cascade,
  name               text not null,
  description        text,
  price              numeric,
  created_at         timestamptz not null default now()
);

create table if not exists public.bookings (
  id                   bigint generated always as identity primary key,
  customer_id          uuid not null references public.profiles (id) on delete cascade,
  vehicle_id           bigint not null references public.vehicles (id),
  service_center_id    bigint not null references public.service_centers (id),
  service_id           bigint references public.services (id),
  booking_date         date not null,
  booking_time         time not null,
  status               text not null default 'pending',  -- pending, confirmed, completed, cancelled
  problem_description  text,
  estimated_cost       numeric,
  final_cost           numeric,
  created_at           timestamptz not null default now()
);


-- ---------------------------------------------------------------------
-- 2. ADJUSTMENTS FOR TABLES THAT ALREADY EXISTED
--    These do nothing on a brand-new database.
-- ---------------------------------------------------------------------

-- If a services table already existed, make sure it has the columns the app uses.
alter table public.services add column if not exists service_center_id bigint;
alter table public.services add column if not exists name text;
alter table public.services add column if not exists description text;
alter table public.services add column if not exists price numeric;

-- Customers no longer have login accounts, so a customer row needs its own id
-- and may have no email.
alter table public.profiles alter column id set default gen_random_uuid();
alter table public.profiles alter column email drop not null;

do $$
declare
  r record;
begin
  -- Customer rows must not be tied to Supabase Auth users any more.
  for r in
    select c.conrelid::regclass as tbl, c.conname
    from pg_constraint c
    where c.contype = 'f'
      and c.conrelid in (
        'public.profiles'::regclass,
        'public.vehicles'::regclass,
        'public.bookings'::regclass
      )
      and c.confrelid = 'auth.users'::regclass
  loop
    execute format('alter table %s drop constraint %I', r.tbl, r.conname);
  end loop;

  -- The app joins these tables, so make sure the links between them exist.
  for r in
    select *
    from (values
      ('vehicles', 'user_id',           'profiles'),
      ('bookings', 'customer_id',       'profiles'),
      ('services', 'service_center_id', 'service_centers'),
      ('bookings', 'service_id',        'services')
    ) as t (tbl, col, ref)
  loop
    if not exists (
      select 1
      from pg_constraint c
      join pg_attribute a
        on a.attrelid = c.conrelid and a.attnum = any (c.conkey)
      where c.contype = 'f'
        and c.conrelid = format('public.%I', r.tbl)::regclass
        and a.attname = r.col
    ) then
      execute format(
        'alter table public.%I add constraint %I foreign key (%I) references public.%I (id)',
        r.tbl, r.tbl || '_' || r.col || '_fkey', r.col, r.ref
      );
    end if;
  end loop;
end $$;

-- Remove pieces from the earlier version of this file, where customers
-- had accounts. They are not used any more.
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop trigger if exists set_booking_defaults on public.bookings;
drop function if exists public.set_booking_defaults();
drop function if exists public.cancel_booking(bigint);


-- ---------------------------------------------------------------------
-- 3. FUNCTIONS
-- ---------------------------------------------------------------------

-- Is the signed-in user an admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

-- Turns "+91 98765 43210" or "098765-43210" into "9876543210".
create or replace function public.clean_phone(p_phone text)
returns text
language sql
immutable
as $$
  select right(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), 10);
$$;

-- Called by the public booking form. Checks everything the visitor sent,
-- then saves the customer (found by phone number, or created), their
-- vehicle (found by registration number, or created) and the booking.
-- Returns the booking number.
--
-- Visitors cannot write to the tables directly; this function is the only
-- way in. The status always starts as 'pending' and the estimated cost
-- always comes from the service price, whatever the browser sent.
create or replace function public.create_guest_booking(
  p_full_name            text,
  p_phone                text,
  p_email                text,
  p_registration_number  text,
  p_brand                text,
  p_model                text,
  p_year                 integer,
  p_fuel_type            text,
  p_service_center_id    bigint,
  p_service_id           bigint,
  p_booking_date         date,
  p_booking_time         time,
  p_problem_description  text
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name     text := nullif(btrim(p_full_name), '');
  v_phone    text := public.clean_phone(p_phone);
  v_email    text := nullif(lower(btrim(p_email)), '');
  v_reg      text := upper(regexp_replace(coalesce(p_registration_number, ''), '\s', '', 'g'));
  v_brand    text := nullif(btrim(p_brand), '');
  v_model    text := nullif(btrim(p_model), '');
  v_fuel     text := nullif(btrim(p_fuel_type), '');
  v_problem  text := nullif(btrim(p_problem_description), '');

  v_open            time;
  v_close           time;
  v_service_center  bigint;
  v_price           numeric;

  v_customer_id  uuid;
  v_vehicle_id   bigint;
  v_booking_id   bigint;
begin
  -- ---- Check the customer and vehicle details ----
  if v_name is null or length(v_name) > 100 then
    raise exception 'Enter your full name.';
  end if;

  if length(v_phone) <> 10 then
    raise exception 'Enter a 10-digit phone number.';
  end if;

  if v_email is not null and (length(v_email) > 200 or v_email not like '%_@_%') then
    raise exception 'Enter a valid email address, or leave it empty.';
  end if;

  if v_reg = '' or length(v_reg) > 15 then
    raise exception 'Enter the vehicle registration number.';
  end if;

  if v_brand is null or length(v_brand) > 50 or v_model is null or length(v_model) > 50 then
    raise exception 'Enter the vehicle brand and model.';
  end if;

  if p_year is not null
     and (p_year < 1950 or p_year > extract(year from current_date)::integer + 1) then
    raise exception 'Enter a valid vehicle year.';
  end if;

  if length(v_fuel) > 30 or length(v_problem) > 1000 then
    raise exception 'One of the answers is too long.';
  end if;

  -- ---- Check the date and time ----
  if p_booking_date is null or p_booking_time is null then
    raise exception 'Choose a date and time.';
  end if;

  -- "current_date - 1" allows for the visitor being in a different time zone
  -- from the database server. The website checks the exact local date.
  if p_booking_date < current_date - 1 then
    raise exception 'Choose today or a later date.';
  end if;

  if p_booking_date > current_date + 180 then
    raise exception 'Choose a date within the next six months.';
  end if;

  -- ---- Check the service center and service ----
  select c.opening_time, c.closing_time
    into v_open, v_close
  from public.service_centers c
  where c.id = p_service_center_id;

  if not found then
    raise exception 'The selected service center does not exist.';
  end if;

  if v_open is not null and v_close is not null
     and (p_booking_time < v_open or p_booking_time > v_close) then
    raise exception 'The service center is closed at that time.';
  end if;

  if p_service_id is not null then
    select s.service_center_id, s.price
      into v_service_center, v_price
    from public.services s
    where s.id = p_service_id;

    if not found then
      raise exception 'The selected service does not exist.';
    end if;

    if v_service_center is not null and v_service_center <> p_service_center_id then
      raise exception 'The selected service is not offered by this service center.';
    end if;
  elsif v_problem is null then
    raise exception 'Choose a service or describe the problem.';
  end if;

  -- ---- Find or create the customer (by phone number) ----
  select p.id
    into v_customer_id
  from public.profiles p
  where p.phone = v_phone
    and p.role = 'customer'
  order by p.created_at
  limit 1;

  if v_customer_id is null then
    begin
      insert into public.profiles (full_name, email, phone, role)
      values (v_name, v_email, v_phone, 'customer')
      returning id into v_customer_id;
    exception when unique_violation then
      -- The email is already used by another row: save without it.
      insert into public.profiles (full_name, email, phone, role)
      values (v_name, null, v_phone, 'customer')
      returning id into v_customer_id;
    end;
  end if;

  -- ---- Find or create the vehicle (by registration number) ----
  select v.id
    into v_vehicle_id
  from public.vehicles v
  where v.user_id = v_customer_id
    and upper(regexp_replace(v.registration_number, '\s', '', 'g')) = v_reg
  limit 1;

  if v_vehicle_id is null then
    insert into public.vehicles (user_id, registration_number, brand, model, year, fuel_type)
    values (v_customer_id, v_reg, v_brand, v_model, p_year, v_fuel)
    returning id into v_vehicle_id;
  end if;

  -- ---- Save the booking ----
  insert into public.bookings (
    customer_id, vehicle_id, service_center_id, service_id,
    booking_date, booking_time, status, problem_description,
    estimated_cost, final_cost
  )
  values (
    v_customer_id, v_vehicle_id, p_service_center_id, p_service_id,
    p_booking_date, p_booking_time, 'pending', v_problem,
    v_price, null
  )
  returning id into v_booking_id;

  return v_booking_id;
end;
$$;

-- Called by the public "Track a Booking" page. Returns the booking only
-- when the booking number AND the phone number both match.
create or replace function public.track_booking(p_booking_id bigint, p_phone text)
returns table (
  id                      bigint,
  status                  text,
  booking_date            date,
  booking_time            time,
  estimated_cost          numeric,
  final_cost              numeric,
  problem_description     text,
  vehicle                 text,
  service_name            text,
  service_center_name     text,
  service_center_address  text,
  service_center_phone    text
)
language sql
security definer
stable
set search_path = public
as $$
  select
    b.id,
    b.status,
    b.booking_date,
    b.booking_time,
    b.estimated_cost,
    b.final_cost,
    b.problem_description,
    v.brand || ' ' || v.model || ' (' || v.registration_number || ')',
    s.name,
    c.name,
    c.address,
    c.phone
  from public.bookings b
  join public.profiles p on p.id = b.customer_id
  left join public.vehicles v on v.id = b.vehicle_id
  left join public.service_centers c on c.id = b.service_center_id
  left join public.services s on s.id = b.service_id
  where b.id = p_booking_id
    and p.phone = public.clean_phone(p_phone);
$$;

-- Called by the "Cancel this booking" button on the tracking page.
-- Works only while the booking is still pending.
create or replace function public.cancel_guest_booking(p_booking_id bigint, p_phone text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.bookings b
  set status = 'cancelled'
  from public.profiles p
  where b.id = p_booking_id
    and p.id = b.customer_id
    and p.phone = public.clean_phone(p_phone)
    and b.status = 'pending';

  if not found then
    raise exception 'Only a pending booking can be cancelled. Check the booking number and phone number.';
  end if;
end;
$$;

-- Visitors (the "anon" role) and the signed-in admin may call these.
grant execute on function public.clean_phone(text) to anon, authenticated;
grant execute on function public.create_guest_booking(
  text, text, text, text, text, text, integer, text, bigint, bigint, date, time, text
) to anon, authenticated;
grant execute on function public.track_booking(bigint, text) to anon, authenticated;
grant execute on function public.cancel_guest_booking(bigint, text) to anon, authenticated;


-- ---------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY
--    With RLS on, nothing can be read or changed unless a policy below
--    allows it.
--
--    Visitors can only READ service centers and services (to fill the
--    booking form). They cannot read customers, vehicles or bookings,
--    and cannot write to any table. Everything else is admin-only.
-- ---------------------------------------------------------------------

alter table public.profiles        enable row level security;
alter table public.vehicles        enable row level security;
alter table public.service_centers enable row level security;
alter table public.services        enable row level security;
alter table public.bookings        enable row level security;

-- Remove the rules from the earlier version, where customers had accounts.
drop policy if exists "Customers can read own vehicles"          on public.vehicles;
drop policy if exists "Customers can add own vehicles"           on public.vehicles;
drop policy if exists "Customers can remove own vehicles"        on public.vehicles;
drop policy if exists "Customers can read own bookings"          on public.bookings;
drop policy if exists "Customers can create own bookings"        on public.bookings;
drop policy if exists "Signed-in users can read service centers" on public.service_centers;
drop policy if exists "Admins can read all service centers"      on public.service_centers;
drop policy if exists "Signed-in users can read services"        on public.services;

-- ---- profiles -------------------------------------------------------
-- The admin reads their own row at sign-in, and can read all customers.

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select to authenticated
  using (id = auth.uid());

drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles"
  on public.profiles for select to authenticated
  using (public.is_admin());

-- ---- vehicles -------------------------------------------------------

drop policy if exists "Admins can read all vehicles" on public.vehicles;
create policy "Admins can read all vehicles"
  on public.vehicles for select to authenticated
  using (public.is_admin());

-- ---- service_centers ------------------------------------------------
-- Everyone can see the centers; only admins can add or edit them.

drop policy if exists "Anyone can read service centers" on public.service_centers;
create policy "Anyone can read service centers"
  on public.service_centers for select to anon, authenticated
  using (true);

drop policy if exists "Admins can add service centers" on public.service_centers;
create policy "Admins can add service centers"
  on public.service_centers for insert to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can update service centers" on public.service_centers;
create policy "Admins can update service centers"
  on public.service_centers for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---- services -------------------------------------------------------
-- Everyone can see the services; only admins can add or edit them.

drop policy if exists "Anyone can read services" on public.services;
create policy "Anyone can read services"
  on public.services for select to anon, authenticated
  using (true);

drop policy if exists "Admins can add services" on public.services;
create policy "Admins can add services"
  on public.services for insert to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can update services" on public.services;
create policy "Admins can update services"
  on public.services for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---- bookings -------------------------------------------------------
-- Admins read all bookings and update status and final cost.
-- New bookings come in only through create_guest_booking.

drop policy if exists "Admins can read all bookings" on public.bookings;
create policy "Admins can read all bookings"
  on public.bookings for select to authenticated
  using (public.is_admin());

drop policy if exists "Admins can update bookings" on public.bookings;
create policy "Admins can update bookings"
  on public.bookings for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());


-- ---------------------------------------------------------------------
-- 5. Tell the Supabase API to pick up the changes straight away.
-- ---------------------------------------------------------------------

notify pgrst, 'reload schema';


-- =====================================================================
-- MAKING AN ADMIN
--
-- 1. Supabase dashboard -> Authentication -> Users -> Add user.
--    Enter the admin's email and a password, keep "Auto Confirm User" on.
-- 2. Run this separately, with that email:
--
--   insert into public.profiles (id, full_name, email, role)
--   select id, 'Admin', email, 'admin'
--   from auth.users
--   where email = 'your-email@example.com'
--   on conflict (id) do update set role = 'admin';
--
-- =====================================================================
