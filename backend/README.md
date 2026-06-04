# Backend Data Udara

Backend sederhana untuk menerima data ESP32 dari `iot/code.cpp`, menyimpan data ke SQLite melalui Prisma, dan menyediakan endpoint untuk melihat data.

## Setup

Dengan Node.js/npm:

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npx prisma migrate dev --name init
npm run dev
```

Dengan Bun:

```bash
cd backend
cp .env.example .env
bun install
bunx prisma generate
bunx prisma migrate dev --name init
bun run dev:bun
```

Server berjalan di port `8080`, cocok dengan URL pada kode IoT:

```cpp
#define API_URL "http://192.168.0.102:8080/api/sensors"
```

Ganti `192.168.0.102` dengan IP laptop yang menjalankan backend jika berubah.

## Dashboard realtime

Buka halaman monitor:

```http
GET /
```

Contoh:

```text
http://localhost:8080
```

Dashboard memakai Server-Sent Events, jadi browser akan menerima data terbaru otomatis setiap ESP32 mengirim `POST /api/sensors`.

## Worker simulasi Python

Jalankan backend Node/Bun lebih dulu, lalu jalankan worker simulasi sensor:

```bash
cd backend
python3 workers/simulate_sensor.py
```

Kirim 20 data dengan interval 2 detik:

```bash
python3 workers/simulate_sensor.py --count 20 --interval 2
```

Interval juga bisa diatur lewat environment variable:

```bash
SENSOR_INTERVAL=1 python3 workers/simulate_sensor.py
```

Atau lewat script package:

```bash
bun run worker -- --interval 2 --count 20
```

Jika backend berjalan di host atau port lain:

```bash
python3 workers/simulate_sensor.py --url http://127.0.0.1:8080/api/sensors
```

## Struktur folder

```text
src/
  app.js                 # setup Express middleware dan routes
  server.js              # start server dan shutdown Prisma
  config/                # konfigurasi environment
  lib/                   # koneksi library, termasuk Prisma
  middleware/            # error handler dan not found
  routes/                # endpoint HTTP
  services/              # logika database dan SSE
  utils/                 # parser dan serializer
workers/
  simulate_sensor.py     # entrypoint worker
  sensor_simulator/      # modul worker Python
```

## Endpoint

### Health check

```http
GET /health
```

### Simpan data sensor

```http
POST /api/sensors
Content-Type: application/json

{
  "nh3_ppm": 12.5,
  "co2_ppm": 450.25
}
```

### Ambil data terbaru

```http
GET /api/sensors/latest
```

### Ambil daftar data

```http
GET /api/sensors?limit=50
```

### Ringkasan data

```http
GET /api/sensors/summary
```

### Stream realtime SSE

```http
GET /api/sensors/events
```
