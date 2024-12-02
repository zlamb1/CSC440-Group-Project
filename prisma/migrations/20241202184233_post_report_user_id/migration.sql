/*
  Warnings:

  - Added the required column `userId` to the `PostReport` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PostReport" ADD COLUMN     "userId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + '7 days'::interval;

-- AddForeignKey
ALTER TABLE "PostReport" ADD CONSTRAINT "PostReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
