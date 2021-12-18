/*
  Warnings:

  - Added the required column `discordId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "discordId" TEXT NOT NULL,
    "portalUsername" TEXT NOT NULL,
    "portalPassword" TEXT NOT NULL
);
INSERT INTO "new_User" ("id", "portalPassword", "portalUsername") SELECT "id", "portalPassword", "portalUsername" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
