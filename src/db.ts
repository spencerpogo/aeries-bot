import p from "@prisma/client";

export const prisma = new p.PrismaClient({
  log: ["query", "info", "warn", "error"],
});
