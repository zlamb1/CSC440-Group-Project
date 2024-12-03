-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + '7 days'::interval;

-- CreateTable
CREATE TABLE "NotificationSettings" (
    "userId" UUID NOT NULL,
    "muteReplies" BOOLEAN NOT NULL,
    "muteRequests" BOOLEAN NOT NULL,
    "dismissReplies" BOOLEAN NOT NULL,
    "dismissRequests" BOOLEAN NOT NULL,

    CONSTRAINT "NotificationSettings_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "NotificationSettings" ADD CONSTRAINT "NotificationSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
