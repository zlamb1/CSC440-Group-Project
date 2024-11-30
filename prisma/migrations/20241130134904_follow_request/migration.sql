-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + '7 days'::interval;

-- CreateTable
CREATE TABLE "FollowRequest" (
    "requestorId" UUID NOT NULL,
    "requestedId" UUID NOT NULL,

    CONSTRAINT "FollowRequest_pkey" PRIMARY KEY ("requestorId","requestedId")
);

-- AddForeignKey
ALTER TABLE "FollowRequest" ADD CONSTRAINT "FollowRequest_requestorId_fkey" FOREIGN KEY ("requestorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "FollowRequest" ADD CONSTRAINT "FollowRequest_requestedId_fkey" FOREIGN KEY ("requestedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
