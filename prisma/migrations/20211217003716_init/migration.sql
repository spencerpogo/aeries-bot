-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "portalUsername" TEXT NOT NULL,
    "portalPassword" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Class" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gradebookUrl" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "teacher" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "gradeSummary" TEXT NOT NULL,
    "missing" TEXT NOT NULL
);
