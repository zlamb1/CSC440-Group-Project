-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Genre" ADD VALUE 'SCARY';
ALTER TYPE "Genre" ADD VALUE 'ACTION';
ALTER TYPE "Genre" ADD VALUE 'FICTION';
ALTER TYPE "Genre" ADD VALUE 'MUSIC';
ALTER TYPE "Genre" ADD VALUE 'TELEVISION';
ALTER TYPE "Genre" ADD VALUE 'ART';
ALTER TYPE "Genre" ADD VALUE 'POLITICAL';

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + '7 days'::interval;
