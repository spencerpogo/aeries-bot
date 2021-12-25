-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "discordId" TEXT NOT NULL,
    "portalUsername" TEXT NOT NULL,
    "portalPassword" TEXT NOT NULL,
    "notificationsEnabled" BOOLEAN NOT NULL,
    "notificationsCache" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");
