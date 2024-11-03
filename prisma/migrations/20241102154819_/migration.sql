/*
  Warnings:

  - You are about to drop the column `likeCount` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `replyCount` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "likeCount",
DROP COLUMN "replyCount";

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + '7 days'::interval;
