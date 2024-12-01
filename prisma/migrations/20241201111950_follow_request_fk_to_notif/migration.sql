/*
  Warnings:

  - You are about to drop the column `notificationId` on the `FollowRequest` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[followRequestId]` on the table `Notification` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "FollowRequest" DROP CONSTRAINT "FollowRequest_notificationId_fkey";

-- DropIndex
DROP INDEX "FollowRequest_notificationId_key";

-- AlterTable
ALTER TABLE "FollowRequest" DROP COLUMN "notificationId";

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + '7 days'::interval;

-- CreateIndex
CREATE UNIQUE INDEX "Notification_followRequestId_key" ON "Notification"("followRequestId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_followRequestId_fkey" FOREIGN KEY ("followRequestId") REFERENCES "FollowRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
