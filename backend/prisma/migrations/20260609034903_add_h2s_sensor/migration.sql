-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_air_readings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nh3_ppm" REAL NOT NULL,
    "co2_ppm" REAL NOT NULL,
    "h2s_ppm" REAL NOT NULL DEFAULT 0.0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_air_readings" ("co2_ppm", "created_at", "id", "nh3_ppm") SELECT "co2_ppm", "created_at", "id", "nh3_ppm" FROM "air_readings";
DROP TABLE "air_readings";
ALTER TABLE "new_air_readings" RENAME TO "air_readings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
