import { PrismaClient } from '@prisma/client';
import { google } from 'googleapis';
import path from 'path';

const prisma = new PrismaClient();

export async function exportToGoogleSheets() {
  try {
    // 1. Ambil data dari Prisma
    const sensorData = await prisma.sensorLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100 
    });

    const rows = sensorData.map(data => [
      data.createdAt.toISOString(),
      data.nh3_ppm,
      data.ch4_ppm, // Menggunakan ch4_ppm (atau co2_ppm sesuai skema DB Anda)
      data.h2s_ppm
    ]);

    const spreadsheetData = [
      ["Timestamp", "NH3 (ppm)", "CH4 (ppm)", "H2S (ppm)"],
      ...rows
    ];

    // 2. Autentikasi Menggunakan file credentials.json di root folder
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(process.cwd(), 'credentials.json'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // 3. Ekspor ke Google Sheet menggunakan ID dari file .env
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      range: 'Sheet1!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: spreadsheetData,
      },
    });

    console.log('✅ Sinkronisasi Google Sheets berhasil!');
  } catch (error) {
    console.error('❌ Gagal ekspor ke Google Sheets:', error);
  }
}