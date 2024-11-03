-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_replyTo_fkey";

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + '7 days'::interval;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_replyTo_fkey" FOREIGN KEY ("replyTo") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
