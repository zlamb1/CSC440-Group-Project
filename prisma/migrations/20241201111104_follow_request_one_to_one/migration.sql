/*
  Warnings:

  - The primary key for the `FollowRequest` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `requestedId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `requestorId` on the `Notification` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[notificationId]` on the table `FollowRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_requestorId_requestedId_fkey";

-- AlterTable
ALTER TABLE "FollowRequest" DROP CONSTRAINT "FollowRequest_pkey",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
ADD COLUMN     "notificationId" BIGINT,
ADD CONSTRAINT "FollowRequest_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "requestedId",
DROP COLUMN "requestorId",
ADD COLUMN     "followRequestId" BIGINT;

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + '7 days'::interval;

-- CreateIndex
CREATE UNIQUE INDEX "FollowRequest_notificationId_key" ON "FollowRequest"("notificationId");

-- AddForeignKey
ALTER TABLE "FollowRequest" ADD CONSTRAINT "FollowRequest_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
