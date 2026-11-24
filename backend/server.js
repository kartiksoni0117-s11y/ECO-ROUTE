const fs = require("node:fs");
const path = require("node:path");
const express = require("express");
const Database = require("better-sqlite3");

const dataDirectory = path.join(__dirname, "data");
fs.mkdirSync(dataDirectory, { recursive: true });

const db = new Database(path.join(dataDirectory, "ecoroute.sqlite"));
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY,
    registration TEXT UNIQUE,
    vehicle_type TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'idle', 'maintenance', 'inactive'))
  );

  CREATE TABLE IF NOT EXISTS bins (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location_label TEXT NOT NULL,
    sector TEXT,
    latitude REAL,
    longitude REAL,
    capacity_liters INTEGER CHECK (capacity_liters IS NULL OR capacity_liters > 0),
    waste_stream TEXT,
    fill_percent REAL NOT NULL CHECK (fill_percent BETWEEN 0 AND 100),
    severity TEXT NOT NULL CHECK (severity IN ('normal', 'medium', 'high', 'critical')),
    overflow_eta_text TEXT,
    sensor_status TEXT NOT NULL,
    fill_velocity_label TEXT,
    source TEXT NOT NULL,
    observed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assigned_vehicle_id TEXT,
    assigned_vehicle_type TEXT,
    assigned_vehicle_eta_minutes INTEGER CHECK (
      assigned_vehicle_eta_minutes IS NULL OR assigned_vehicle_eta_minutes >= 0
    ),
    distance_km REAL CHECK (distance_km IS NULL OR distance_km >= 0),
    assigned_driver_name TEXT
  );
`);

const sampleBins = [
  {
    id: "BIN-GWL-214",
    name: "Phool Bagh West",
    location_label: "Phool Bagh",
    sector: "Phool Bagh",
    fill_percent: 34,
    severity: "normal",
  },
  {
    id: "BIN-GWL-305",
    name: "City Centre North",
    location_label: "Collectorate Road",
    sector: "City Centre",
    fill_percent: 42,
    severity: "normal",
  },
  {
    id: "BIN-GWL-412",
    name: "Thatipur South",
    location_label: "Thatipur Pocket B",
    sector: "Thatipur",
    fill_percent: 28,
    severity: "normal",
  },
  {
    id: "BIN-GWL-140",
    name: "Lashkar Sarafa Bazaar",
    location_label: "Sarafa Bazaar",
    sector: "Lashkar",
    fill_percent: 76,
    severity: "medium",
  },
  {
    id: "BIN-GWL-402",
    name: "Thatipur Main Chowk",
    location_label: "Thatipur Main Chowk Commercial Complex",
    sector: "Thatipur",
    waste_stream: "Dry & Food",
    fill_percent: 89,
    severity: "critical",
    assigned_vehicle_id: "TRK-04",
    assigned_vehicle_type: "Electric Tipper 6T",
    assigned_vehicle_eta_minutes: 14,
  },
  {
    id: "BIN-GWL-108",
    name: "Maharaj Bada Main Market",
    location_label: "Maharaj Bada Main Market",
    sector: "Lashkar",
    capacity_liters: 1100,
    waste_stream: "Commercial Mix",
    fill_percent: 94,
    severity: "critical",
    overflow_eta_text: "25 mins",
    fill_velocity_label: "+18%/hr",
    assigned_vehicle_id: "TRK-01",
    assigned_vehicle_type: "10T Compactor",
    assigned_vehicle_eta_minutes: 8,
    distance_km: 0.7,
    assigned_driver_name: "Rajesh Yadav",
  },
  {
    id: "BIN-GWL-518",
    name: "Morar Subzi Mandi Main Gate",
    location_label: "Morar Subzi Mandi Main Gate",
    sector: "Morar",
    waste_stream: "Vegetable Waste",
    fill_percent: 92,
    severity: "critical",
    overflow_eta_text: "Imminent",
  },
  {
    id: "BIN-GWL-219",
    name: "Phool Bagh Main Gate & Bus Stop",
    location_label: "Phool Bagh Main Gate & Bus Stop",
    sector: "Phool Bagh",
    fill_percent: 88,
    severity: "high",
    overflow_eta_text: "35m buffer",
    assigned_vehicle_id: "TRK-01",
    assigned_vehicle_type: "10T Compactor",
  },
  {
    id: "BIN-GWL-310",
    name: "Gwalior Junction South Circulating Area",
    location_label: "Gwalior Junction South Circulating Area",
    sector: "Gwalior Junction",
    fill_percent: 85,
    severity: "high",
    overflow_eta_text: "Spill in 40m",
  },
].map((bin) => ({
  ...bin,
  latitude: null,
  longitude: null,
  capacity_liters: bin.capacity_liters ?? null,
  waste_stream: bin.waste_stream ?? null,
  overflow_eta_text: bin.overflow_eta_text ?? null,
  sensor_status: "Simulated",
  fill_velocity_label: bin.fill_velocity_label ?? null,
  source: "demo",
  assigned_vehicle_id: bin.assigned_vehicle_id ?? null,
  assigned_vehicle_type: bin.assigned_vehicle_type ?? null,
  assigned_vehicle_eta_minutes: bin.assigned_vehicle_eta_minutes ?? null,
  distance_km: bin.distance_km ?? null,
  assigned_driver_name: bin.assigned_driver_name ?? null,
}));

const sampleVehicles = [
  {
    id: "TRK-01",
    registration: "MP-07-GA-1120",
    vehicle_type: "10T Compactor",
    status: "active",
  },
  {
    id: "TRK-04",
    registration: "MP-07-EV-3490",
    vehicle_type: "Electric Tipper 6T",
    status: "active",
  },
];

const seedDatabase = db.transaction(() => {
  const binCount = db.prepare("SELECT COUNT(*) AS count FROM bins").get().count;
  if (binCount === 0) {
    const insertBin = db.prepare(`
      INSERT INTO bins (
        id, name, location_label, sector, latitude, longitude, capacity_liters,
        waste_stream, fill_percent, severity, overflow_eta_text, sensor_status,
        fill_velocity_label, source, assigned_vehicle_id, assigned_vehicle_type,
        assigned_vehicle_eta_minutes, distance_km, assigned_driver_name
      ) VALUES (
        @id, @name, @location_label, @sector, @latitude, @longitude, @capacity_liters,
        @waste_stream, @fill_percent, @severity, @overflow_eta_text, @sensor_status,
        @fill_velocity_label, @source, @assigned_vehicle_id, @assigned_vehicle_type,
        @assigned_vehicle_eta_minutes, @distance_km, @assigned_driver_name
      )
    `);
    for (const bin of sampleBins) insertBin.run(bin);
  }

  const vehicleCount = db.prepare("SELECT COUNT(*) AS count FROM vehicles").get().count;
  if (vehicleCount === 0) {
    const insertVehicle = db.prepare(`
      INSERT INTO vehicles (id, registration, vehicle_type, status)
      VALUES (@id, @registration, @vehicle_type, @status)
    `);
    for (const vehicle of sampleVehicles) insertVehicle.run(vehicle);
  }
});
seedDatabase();

const app = express();
app.use(express.json({ limit: "16kb" }));
app.use((request, response, next) => {
  const origin = request.get("Origin");
  const isLocalOrigin =
    origin === "null" ||
    (origin && /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/i.test(origin));

  if (isLocalOrigin) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
  }
  next();
});

app.get("/api/health", (_request, response, next) => {
  try {
    db.prepare("SELECT 1").get();
    response.json({ status: "ok", database: "connected" });
  } catch (error) {
    next(error);
  }
});

app.get("/api/bins", (_request, response, next) => {
  try {
    const bins = db.prepare("SELECT * FROM bins ORDER BY id").all();
    response.json(bins);
  } catch (error) {
    next(error);
  }
});

app.get("/api/vehicles", (_request, response, next) => {
  try {
    const vehicles = db.prepare("SELECT * FROM vehicles ORDER BY id").all();
    response.json(vehicles);
  } catch (error) {
    next(error);
  }
});

app.use((_request, response) => {
  response.status(404).json({ error: "Not found" });
});

app.use((error, _request, response, _next) => {
  console.error("EcoRoute API request failed.", error);
  const status = Number.isInteger(error.status) ? error.status : 500;
  response.status(status).json({
    error: status < 500 ? "Invalid request" : "Internal server error",
  });
});

module.exports = { app, db };

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error("PORT must be an integer between 1 and 65535.");
    db.close();
    process.exitCode = 1;
  } else {
    const server = app.listen(port, "127.0.0.1", () => {
      console.info(`EcoRoute API listening at http://127.0.0.1:${port}`);
    });

    server.on("error", (error) => {
      console.error("Could not start the EcoRoute API server.", error);
      db.close();
      process.exitCode = 1;
    });

    const shutdown = () => {
      server.close(() => {
        db.close();
        process.exit(0);
      });
    };
    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
  }
}
