-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + '7 days'::interval;

-- CreateTable
CREATE TABLE "PostReport" (
    "reportId" UUID NOT NULL,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postId" UUID NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "PostReport_pkey" PRIMARY KEY ("reportId")
);

-- AddForeignKey
ALTER TABLE "PostReport" ADD CONSTRAINT "PostReport_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
