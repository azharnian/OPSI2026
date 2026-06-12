/*
  Warnings:

  - You are about to drop the column `co2_ppm` on the `air_readings` table. All the data in the column will be lost.
  - Added the required column `ch4_ppm` to the `air_readings` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_air_readings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nh3_ppm" REAL NOT NULL,
    "ch4_ppm" REAL NOT NULL,
    "h2s_ppm" REAL NOT NULL DEFAULT 0.0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_air_readings" ("created_at", "h2s_ppm", "id", "nh3_ppm") SELECT "created_at", "h2s_ppm", "id", "nh3_ppm" FROM "air_readings";
DROP TABLE "air_readings";
ALTER TABLE "new_air_readings" RENAME TO "air_readings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
