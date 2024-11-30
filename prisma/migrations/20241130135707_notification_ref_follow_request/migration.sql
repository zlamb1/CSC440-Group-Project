-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "requestedId" UUID,
ADD COLUMN     "requestorId" UUID;

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + '7 days'::interval;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_requestorId_requestedId_fkey" FOREIGN KEY ("requestorId", "requestedId") REFERENCES "FollowRequest"("requestorId", "requestedId") ON DELETE CASCADE ON UPDATE NO ACTION;
