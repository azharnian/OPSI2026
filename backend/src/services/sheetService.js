const { getSheets } = require("../lib/googleSheets");
const { env } = require("../config/env");
const { prisma } = require("../lib/prisma");

const SHEET_NAME = "Sheet1";
const HEADER_ROW = ["Timestamp", "NH3 (ppm)", "CO2 (ppm)", "H2S (ppm)"];

/**
 * Append satu baris data sensor ke Google Sheets.
 * Dipanggil secara fire-and-forget setiap kali ada POST baru.
 */
async function appendRowToSheet(reading) {
  if (!env.googleSpreadsheetId) {
    console.warn("[Sheets] GOOGLE_SPREADSHEET_ID belum di-set, skip append.");
    return;
  }

  try {
    const sheets = await getSheets();

    const row = [
      reading.created_at
        ? new Date(reading.created_at).toISOString()
        : new Date().toISOString(),
      reading.nh3_ppm,
      reading.co2_ppm,
      reading.h2s_ppm,
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: env.googleSpreadsheetId,
      range: `${SHEET_NAME}!A:D`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [row] },
    });

    console.log("[Sheets] Baris baru berhasil ditambahkan.");
  } catch (error) {
    console.error("[Sheets] Gagal append ke Google Sheets:", error.message);
  }
}

/**
 * Full-sync: tulis ulang seluruh data dari database ke Google Sheets.
 * Berguna untuk inisialisasi awal atau memperbaiki data yang tidak sinkron.
 */
async function syncAllToSheet() {
  if (!env.googleSpreadsheetId) {
    throw new Error("GOOGLE_SPREADSHEET_ID belum di-set di .env");
  }

  const sheets = await getSheets();

  const allReadings = await prisma.airReading.findMany({
    orderBy: { createdAt: "asc" },
  });

  const rows = allReadings.map((r) => [
    r.createdAt.toISOString(),
    r.nh3Ppm,
    r.co2Ppm,
    r.h2sPpm,
  ]);

  const values = [HEADER_ROW, ...rows];

  // Hapus data lama di sheet terlebih dahulu
  await sheets.spreadsheets.values.clear({
    spreadsheetId: env.googleSpreadsheetId,
    range: `${SHEET_NAME}`,
  });

  // Tulis ulang semua data
  await sheets.spreadsheets.values.update({
    spreadsheetId: env.googleSpreadsheetId,
    range: `${SHEET_NAME}!A1`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });

  console.log(`[Sheets] Full sync selesai. ${allReadings.length} baris ditulis.`);
  return { synced: allReadings.length };
}

module.exports = { appendRowToSheet, syncAllToSheet };