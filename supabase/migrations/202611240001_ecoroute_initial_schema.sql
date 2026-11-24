-- Initial schema and seed records for the EcoRoute dashboard.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  role text not null default 'viewer'
    check (role in ('admin', 'dispatcher', 'collector', 'viewer')),
  created_at timestamptz not null default now()
);

create table public.zones (
  id text primary key,
  name text not null,
  is_public boolean not null default false,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.bins (
  id text primary key,
  zone_id text not null references public.zones (id),
  name text not null,
  location_label text not null,
  sector text,
  latitude double precision,
  longitude double precision,
  capacity_liters integer check (capacity_liters is null or capacity_liters > 0),
  waste_stream text,
  is_active boolean not null default true,
  is_public boolean not null default false,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  check (
    (latitude is null and longitude is null) or
    (
      latitude is not null and longitude is not null and
      latitude between -90 and 90 and longitude between -180 and 180
    )
  )
);

create table public.drivers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users (id) on delete set null,
  full_name text not null,
  is_public boolean not null default false,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.vehicles (
  id text primary key,
  registration text unique,
  vehicle_type text not null,
  status text not null default 'active'
    check (status in ('active', 'idle', 'maintenance', 'inactive')),
  is_public boolean not null default false,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.routes (
  id uuid primary key default gen_random_uuid(),
  route_code text not null unique,
  vehicle_id text references public.vehicles (id) on delete set null,
  driver_id uuid references public.drivers (id) on delete set null,
  status text not null default 'planned'
    check (status in ('planned', 'active', 'completed', 'cancelled')),
  planned_distance_km numeric(8, 2) check (planned_distance_km is null or planned_distance_km >= 0),
  estimated_duration_minutes integer
    check (estimated_duration_minutes is null or estimated_duration_minutes >= 0),
  route_geometry jsonb,
  is_public boolean not null default false,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  check (completed_at is null or (started_at is not null and completed_at >= started_at))
);

create table public.route_stops (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references public.routes (id) on delete cascade,
  bin_id text not null references public.bins (id),
  stop_order integer not null check (stop_order > 0),
  status text not null default 'planned'
    check (status in ('planned', 'en_route', 'collected', 'skipped')),
  eta_at timestamptz,
  completed_at timestamptz,
  is_public boolean not null default false,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  unique (route_id, stop_order)
);

create table public.bin_readings (
  id uuid primary key default gen_random_uuid(),
  bin_id text not null references public.bins (id) on delete cascade,
  fill_percent numeric(5, 2) not null check (fill_percent between 0 and 100),
  severity_level text not null
    check (severity_level in ('normal', 'medium', 'high', 'critical')),
  overflow_eta_text text,
  sensor_status text not null,
  fill_velocity_label text,
  source text not null default 'device'
    check (source in ('device', 'manual', 'demo')),
  observed_at timestamptz not null default now(),
  is_public boolean not null default false,
  is_demo boolean not null default false
);

create table public.bin_assignments (
  id uuid primary key default gen_random_uuid(),
  bin_id text not null references public.bins (id) on delete cascade,
  vehicle_id text not null references public.vehicles (id),
  driver_id uuid references public.drivers (id) on delete set null,
  route_stop_id uuid references public.route_stops (id) on delete set null,
  eta_minutes integer check (eta_minutes is null or eta_minutes >= 0),
  distance_km numeric(8, 2) check (distance_km is null or distance_km >= 0),
  is_active boolean not null default true,
  is_public boolean not null default false,
  is_demo boolean not null default false,
  assigned_at timestamptz not null default now()
);

create table public.vehicle_positions (
  id uuid primary key default gen_random_uuid(),
  vehicle_id text not null references public.vehicles (id) on delete cascade,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  speed_kph numeric(6, 2) check (speed_kph is null or speed_kph >= 0),
  heading_degrees numeric(5, 2)
    check (heading_degrees is null or heading_degrees between 0 and 360),
  source text not null default 'device'
    check (source in ('device', 'manual', 'demo')),
  recorded_at timestamptz not null default now(),
  is_public boolean not null default false,
  is_demo boolean not null default false
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  route_stop_id uuid unique references public.route_stops (id),
  bin_id text not null references public.bins (id),
  vehicle_id text references public.vehicles (id) on delete set null,
  driver_id uuid references public.drivers (id) on delete set null,
  collected_at timestamptz not null default now(),
  weight_kg numeric(10, 2) check (weight_kg is null or weight_kg >= 0),
  volume_liters numeric(10, 2) check (volume_liters is null or volume_liters >= 0),
  waste_stream text,
  outcome text not null default 'collected'
    check (outcome in ('collected', 'partial', 'blocked', 'skipped')),
  idempotency_key text unique,
  is_public boolean not null default false,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index bin_readings_latest_idx
  on public.bin_readings (bin_id, observed_at desc);
create index vehicle_positions_latest_idx
  on public.vehicle_positions (vehicle_id, recorded_at desc);
create index route_stops_order_idx
  on public.route_stops (route_id, stop_order);
create index collections_collected_at_idx
  on public.collections (collected_at desc);
create index routes_status_created_idx
  on public.routes (status, created_at desc);
create unique index bin_assignments_one_active_idx
  on public.bin_assignments (bin_id)
  where is_active;

create or replace function public.has_app_role(allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = any (allowed_roles)
  );
$$;

create or replace function public.create_viewer_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'display_name', ''),
    'viewer'
  );
  return new;
end;
$$;

create trigger on_auth_user_created_ecoroute_profile
  after insert on auth.users
  for each row execute function public.create_viewer_profile();

create or replace view public.dashboard_bins
with (security_invoker = true)
as
select
  b.id,
  b.name,
  b.location_label,
  b.sector,
  b.latitude,
  b.longitude,
  b.capacity_liters,
  b.waste_stream,
  r.fill_percent,
  r.severity_level as severity,
  r.overflow_eta_text,
  r.sensor_status,
  r.fill_velocity_label,
  r.source,
  r.observed_at,
  a.vehicle_id as assigned_vehicle_id,
  v.vehicle_type as assigned_vehicle_type,
  a.eta_minutes as assigned_vehicle_eta_minutes,
  a.distance_km,
  d.full_name as assigned_driver_name
from public.bins b
join lateral (
  select reading.*
  from public.bin_readings reading
  where reading.bin_id = b.id
  order by reading.observed_at desc, reading.id desc
  limit 1
) r on true
left join lateral (
  select assignment.*
  from public.bin_assignments assignment
  where assignment.bin_id = b.id
    and assignment.is_active
  order by assignment.assigned_at desc, assignment.id desc
  limit 1
) a on true
left join public.drivers d on d.id = a.driver_id
left join public.vehicles v on v.id = a.vehicle_id
where b.is_active and b.is_public;

create or replace view public.dashboard_vehicles
with (security_invoker = true)
as
select id, registration, vehicle_type, status
from public.vehicles
where is_public;

create or replace view public.dashboard_summary
with (security_invoker = true)
as
select
  (select count(*) from public.dashboard_bins) as total_bins,
  (select count(*) from public.dashboard_bins where severity in ('high', 'critical')) as priority_bins,
  (select count(*) from public.dashboard_bins where fill_percent >= 85) as overflowing_bins,
  (select count(*) from public.dashboard_bins where severity = 'critical') as critical_bins,
  (select count(*) from public.dashboard_vehicles where status = 'active') as active_vehicles;

alter table public.profiles enable row level security;
alter table public.zones enable row level security;
alter table public.bins enable row level security;
alter table public.drivers enable row level security;
alter table public.vehicles enable row level security;
alter table public.routes enable row level security;
alter table public.route_stops enable row level security;
alter table public.bin_readings enable row level security;
alter table public.bin_assignments enable row level security;
alter table public.vehicle_positions enable row level security;
alter table public.collections enable row level security;
alter table public.audit_events enable row level security;

create policy "Users read own profile or admins read all"
  on public.profiles for select to authenticated
  using (id = auth.uid() or public.has_app_role(array['admin']));
create policy "Admins update profiles"
  on public.profiles for update to authenticated
  using (public.has_app_role(array['admin']))
  with check (public.has_app_role(array['admin']));

create policy "Public reads published zones and staff read all"
  on public.zones for select to anon, authenticated
  using (is_public or public.has_app_role(array['admin', 'dispatcher', 'collector', 'viewer']));
create policy "Admins manage zones"
  on public.zones for all to authenticated
  using (public.has_app_role(array['admin']))
  with check (public.has_app_role(array['admin']));

create policy "Public reads published bins and staff read all"
  on public.bins for select to anon, authenticated
  using (is_public or public.has_app_role(array['admin', 'dispatcher', 'collector', 'viewer']));
create policy "Admins and dispatchers manage bins"
  on public.bins for all to authenticated
  using (public.has_app_role(array['admin', 'dispatcher']))
  with check (public.has_app_role(array['admin', 'dispatcher']));

create policy "Public reads published drivers and staff read all"
  on public.drivers for select to anon, authenticated
  using (is_public or public.has_app_role(array['admin', 'dispatcher', 'collector', 'viewer']));
create policy "Admins manage drivers"
  on public.drivers for all to authenticated
  using (public.has_app_role(array['admin']))
  with check (public.has_app_role(array['admin']));

create policy "Public reads published vehicles and staff read all"
  on public.vehicles for select to anon, authenticated
  using (is_public or public.has_app_role(array['admin', 'dispatcher', 'collector', 'viewer']));
create policy "Admins and dispatchers manage vehicles"
  on public.vehicles for all to authenticated
  using (public.has_app_role(array['admin', 'dispatcher']))
  with check (public.has_app_role(array['admin', 'dispatcher']));

create policy "Public reads published bin readings and staff read all"
  on public.bin_readings for select to anon, authenticated
  using (
    (is_public and exists (
      select 1 from public.bins b where b.id = bin_id and b.is_public
    ))
    or public.has_app_role(array['admin', 'dispatcher', 'collector', 'viewer'])
  );
create policy "Admins and collectors append bin readings"
  on public.bin_readings for insert to authenticated
  with check (public.has_app_role(array['admin', 'collector']));

create policy "Public reads published assignments and staff read all"
  on public.bin_assignments for select to anon, authenticated
  using (
    (is_public and exists (
      select 1 from public.bins b where b.id = bin_id and b.is_public
    ))
    or public.has_app_role(array['admin', 'dispatcher', 'collector', 'viewer'])
  );
create policy "Admins and dispatchers manage assignments"
  on public.bin_assignments for all to authenticated
  using (public.has_app_role(array['admin', 'dispatcher']))
  with check (public.has_app_role(array['admin', 'dispatcher']));

create policy "Staff read routes"
  on public.routes for select to authenticated
  using (is_public or public.has_app_role(array['admin', 'dispatcher', 'collector', 'viewer']));
create policy "Admins and dispatchers manage routes"
  on public.routes for all to authenticated
  using (public.has_app_role(array['admin', 'dispatcher']))
  with check (public.has_app_role(array['admin', 'dispatcher']));

create policy "Staff read route stops"
  on public.route_stops for select to authenticated
  using (is_public or public.has_app_role(array['admin', 'dispatcher', 'collector', 'viewer']));
create policy "Admins and dispatchers manage route stops"
  on public.route_stops for all to authenticated
  using (public.has_app_role(array['admin', 'dispatcher']))
  with check (public.has_app_role(array['admin', 'dispatcher']));

create policy "Staff read vehicle positions"
  on public.vehicle_positions for select to authenticated
  using (is_public or public.has_app_role(array['admin', 'dispatcher', 'collector', 'viewer']));

create policy "Staff read collections"
  on public.collections for select to authenticated
  using (is_public or public.has_app_role(array['admin', 'dispatcher', 'collector', 'viewer']));

create policy "Admins and dispatchers read audit events"
  on public.audit_events for select to authenticated
  using (public.has_app_role(array['admin', 'dispatcher']));

grant usage on schema public to anon, authenticated;
revoke all on function public.has_app_role(text[]) from public;
grant execute on function public.has_app_role(text[]) to anon, authenticated;

grant select on public.zones, public.bins, public.bin_readings,
  public.drivers, public.vehicles, public.bin_assignments to anon, authenticated;
grant select on public.dashboard_bins, public.dashboard_vehicles,
  public.dashboard_summary to anon, authenticated;
grant select on public.profiles, public.routes, public.route_stops,
  public.vehicle_positions, public.collections, public.audit_events to authenticated;
grant update on public.profiles to authenticated;
grant insert, update, delete on public.zones to authenticated;
grant insert, update, delete on public.bins, public.drivers, public.vehicles,
  public.bin_assignments to authenticated;
grant insert on public.bin_readings to authenticated;
grant insert, update, delete on public.routes, public.route_stops to authenticated;

insert into public.zones (id, name, is_public, is_demo)
values ('GWL', 'Gwalior', true, true);

insert into public.bins (
  id, zone_id, name, location_label, sector, capacity_liters, waste_stream,
  is_public, is_demo
)
values
  ('BIN-GWL-214', 'GWL', 'Phool Bagh West', 'Phool Bagh', 'Phool Bagh', null, null, true, true),
  ('BIN-GWL-305', 'GWL', 'City Centre North', 'Collectorate Road', 'City Centre', null, null, true, true),
  ('BIN-GWL-412', 'GWL', 'Thatipur South', 'Thatipur Pocket B', 'Thatipur', null, null, true, true),
  ('BIN-GWL-140', 'GWL', 'Lashkar Sarafa Bazaar', 'Sarafa Bazaar', 'Lashkar', null, null, true, true),
  ('BIN-GWL-402', 'GWL', 'Thatipur Main Chowk', 'Thatipur Main Chowk Commercial Complex', 'Thatipur', null, 'Dry & Food', true, true),
  ('BIN-GWL-108', 'GWL', 'Maharaj Bada Main Market', 'Maharaj Bada Main Market', 'Lashkar', 1100, 'Commercial Mix', true, true),
  ('BIN-GWL-518', 'GWL', 'Morar Subzi Mandi Main Gate', 'Morar Subzi Mandi Main Gate', 'Morar', null, 'Vegetable Waste', true, true),
  ('BIN-GWL-219', 'GWL', 'Phool Bagh Main Gate & Bus Stop', 'Phool Bagh Main Gate & Bus Stop', 'Phool Bagh', null, null, true, true),
  ('BIN-GWL-310', 'GWL', 'Gwalior Junction South Circulating Area', 'Gwalior Junction South Circulating Area', 'Gwalior Junction', null, null, true, true);

insert into public.drivers (full_name, is_public, is_demo)
values ('Rajesh Yadav', true, true), ('Manoj Sharma', true, true);

insert into public.vehicles (id, registration, vehicle_type, status, is_public, is_demo)
values
  ('TRK-01', 'MP-07-GA-1120', '10T Compactor', 'active', true, true),
  ('TRK-04', 'MP-07-EV-3490', 'Electric Tipper 6T', 'active', true, true);

insert into public.bin_readings (
  bin_id, fill_percent, severity_level, overflow_eta_text, sensor_status,
  fill_velocity_label, source, is_public, is_demo
)
values
  ('BIN-GWL-214', 34, 'normal', null, 'Simulated', null, 'demo', true, true),
  ('BIN-GWL-305', 42, 'normal', null, 'Simulated', null, 'demo', true, true),
  ('BIN-GWL-412', 28, 'normal', null, 'Simulated', null, 'demo', true, true),
  ('BIN-GWL-140', 76, 'medium', null, 'Simulated', null, 'demo', true, true),
  ('BIN-GWL-402', 89, 'critical', null, 'Simulated', null, 'demo', true, true),
  ('BIN-GWL-108', 94, 'critical', '25 mins', 'Simulated', '+18%/hr', 'demo', true, true),
  ('BIN-GWL-518', 92, 'critical', 'Imminent', 'Simulated', null, 'demo', true, true),
  ('BIN-GWL-219', 88, 'high', '35m buffer', 'Simulated', null, 'demo', true, true),
  ('BIN-GWL-310', 85, 'high', 'Spill in 40m', 'Simulated', null, 'demo', true, true);

insert into public.bin_assignments (
  bin_id, vehicle_id, driver_id, eta_minutes, distance_km, is_public, is_demo
)
select 'BIN-GWL-108', 'TRK-01', id, 8, 0.7, true, true
from public.drivers
where full_name = 'Rajesh Yadav';

insert into public.bin_assignments (
  bin_id, vehicle_id, eta_minutes, is_public, is_demo
)
values
  ('BIN-GWL-219', 'TRK-01', null, true, true),
  ('BIN-GWL-402', 'TRK-04', 14, true, true);
