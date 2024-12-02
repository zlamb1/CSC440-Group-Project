/*
  Warnings:

  - The primary key for the `PostReport` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `reportId` on the `PostReport` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PostReport" DROP CONSTRAINT "PostReport_pkey",
DROP COLUMN "reportId",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "PostReport_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + '7 days'::interval;
