-- CreateEnum
CREATE TYPE "Genre" AS ENUM ('COMEDY', 'SCI_FI', 'THRILLER', 'ROMANCE', 'FANTASY');

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + '7 days'::interval;

-- CreateTable
CREATE TABLE "PostGenre" (
    "postId" UUID NOT NULL,
    "genre" "Genre" NOT NULL,

    CONSTRAINT "PostGenre_pkey" PRIMARY KEY ("postId","genre")
);

-- AddForeignKey
ALTER TABLE "PostGenre" ADD CONSTRAINT "PostGenre_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
