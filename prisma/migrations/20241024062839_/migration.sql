-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + '7 days'::interval;
