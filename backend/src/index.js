import express from 'express';
import { PrismaClient } from '@prisma/client'; // Masukkan Prisma Client
import { exportToGoogleSheets } from './services/sheetsService.js';

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

// Endpoint POST yang ditembak oleh ESP32 Anda
app.post('/api/sensors', async (req, res) => {
  // Menerima data dari ESP32 (co2_ppm di sini berisi data sensor Metana MQ-4 yang kita samarkan)
  const { nh3_ppm, co2_ppm, h2s_ppm } = req.body; 

  try {
    // 1. Menyimpan data masuk ke database lokal via Prisma
    // (Asumsi nama model/tabel di schema.prisma Anda adalah 'sensorLog')
    const newLog = await prisma.sensorLog.create({
      data: {
        nh3_ppm: parseFloat(nh3_ppm),
        ch4_ppm: parseFloat(co2_ppm), // Data penyamaran CO2 otomatis disimpan ke kolom CH4 di DB
        h2s_ppm: parseFloat(h2s_ppm),
        createdAt: new Date()         // Menandai waktu otomatis log masuk
      }
    });

    console.log(`[Database] Data berhasil disimpan. ID Log: ${newLog.id}`);

    // 2. Memicu fungsi ekspor otomatis ke Google Sheets
    exportToGoogleSheets(); 

    // 3. Memberi respon balik ke ESP32 agar koneksi HTTP ditutup dengan sukses
    res.status(201).json({ 
      message: "Data saved locally and Google Sheet is updating...",
      data: newLog 
    });

  } catch (error) {
    console.error("❌ Gagal memproses data dari ESP32:", error);
    res.status(500).json({ error: "Gagal menyimpan data ke database server." });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});