-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "data" JSONB;

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + '7 days'::interval;
