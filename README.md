# EcoRoute website

This is a static front-end demo built from the supplied HTML designs:

- `index.html` is the Gwalior operations dashboard.
- `map.html` is an interactive OpenStreetMap view centered on Gwalior.
- `site.js` connects sidebar sections and adds map search, filters, demo asset markers, routes, settings, zoom, and fullscreen controls.
- `site.css` styles the map markers, settings dialog, and smaller-screen layout.

Open `index.html` in a browser, or use a local static server such as the VS Code Live Server extension. The designs load Tailwind CSS, fonts, and some profile imagery from external services, so an internet connection is needed for those assets.

The map uses live OpenStreetMap tiles and includes attribution. Bin, vehicle, route, and dashboard telemetry are demo data; they are not connected to municipal sensors or a live GPS feed. Connecting real fleet data requires a data/API source. Map tiles and external design assets require an internet connection.

## Initial Supabase setup

The dashboard can read the public sample-bin and vehicle views from Supabase. The Live Map remains a separate simulated preview because the dashboard's schematic positions are not geographic coordinates.

1. On a fresh Supabase project, run `supabase/migrations/202611240001_ecoroute_initial_schema.sql` only once in its SQL Editor. Do not rerun it on an already initialized project; it may fail because tables, policies, or triggers from the migration may already exist.
2. Replace the project URL and publishable/anon key placeholders in `supabase-config.js`. This browser key is public; never put a `service_role` key or database password in frontend files.
3. Serve this folder over localhost or HTTPS. Opening the pages with `file://` is not a supported origin for Supabase requests.

The migration seeds the nine existing GWL dashboard bins and two displayed vehicles as demo records. It leaves all geographic coordinates empty, uses BIN-GWL-402's selected value of 89% Critical, and does not create a TRK-06 assignment. The dashboard button opens the separate simulated Live Map; it does not display these dashboard records. The route and analytics panels, dashboard actions, and the Live Map have not yet been connected to Supabase.

New Supabase users receive the `viewer` role. Promote the initial administrator from the SQL Editor using the account's Auth user UUID:

```sql
update public.profiles
set role = 'admin'
where id = 'AUTH_USER_UUID';
```

Role changes are not exposed through the browser. RLS permits public reads only for records explicitly marked public and restricts available writes by role. Collection recording and vehicle-position ingestion remain disabled until transactional RPC/Edge Function endpoints are implemented.
