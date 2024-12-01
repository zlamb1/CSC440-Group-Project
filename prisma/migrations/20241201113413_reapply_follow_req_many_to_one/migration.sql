/*
  Warnings:

  - The primary key for the `FollowRequest` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `FollowRequest` table. All the data in the column will be lost.
  - You are about to drop the column `followRequestId` on the `Notification` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_followRequestId_fkey";

-- DropIndex
DROP INDEX "Notification_followRequestId_key";

-- AlterTable
ALTER TABLE "FollowRequest" DROP CONSTRAINT "FollowRequest_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "FollowRequest_pkey" PRIMARY KEY ("requestorId", "requestedId");

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "followRequestId",
ADD COLUMN     "requestedId" UUID,
ADD COLUMN     "requestorId" UUID;

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + '7 days'::interval;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_requestorId_requestedId_fkey" FOREIGN KEY ("requestorId", "requestedId") REFERENCES "FollowRequest"("requestorId", "requestedId") ON DELETE CASCADE ON UPDATE CASCADE;
