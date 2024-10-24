/*
  Warnings:

  - You are about to drop the `notifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `post_likes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `posts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ProfileVisibility" AS ENUM ('PUBLIC', 'FRIENDS');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('NONE', 'MODERATOR');

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_fkey";

-- DropForeignKey
ALTER TABLE "post_likes" DROP CONSTRAINT "post_likes_post_id_fkey";

-- DropForeignKey
ALTER TABLE "post_likes" DROP CONSTRAINT "post_likes_user_id_fkey";

-- DropForeignKey
ALTER TABLE "posts" DROP CONSTRAINT "posts_poster_id_fkey";

-- DropForeignKey
ALTER TABLE "posts" DROP CONSTRAINT "posts_reply_to_fkey";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_user_id_fkey";

-- DropTable
DROP TABLE "notifications";

-- DropTable
DROP TABLE "post_likes";

-- DropTable
DROP TABLE "posts";

-- DropTable
DROP TABLE "sessions";

-- DropTable
DROP TABLE "users";

-- DropEnum
DROP TYPE "profile_visibility";

-- DropEnum
DROP TYPE "user_role";

-- CreateTable
CREATE TABLE "Notification" (
    "dateIssued" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" VARCHAR,
    "content" VARCHAR,
    "expiresOn" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() + '7 days'::interval),
    "id" BIGSERIAL NOT NULL,
    "userId" UUID NOT NULL,
    "viewed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostLike" (
    "postId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "liked" BOOLEAN NOT NULL DEFAULT true,
    "likedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostLike_pkey" PRIMARY KEY ("postId","userId")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "postedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "replyTo" UUID,
    "likeCount" INTEGER DEFAULT 0,
    "replyCount" INTEGER DEFAULT 0,
    "lastEdited" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "data" JSONB,
    "userId" UUID NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userName" VARCHAR(25) NOT NULL,
    "joinedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "passwordHash" CHAR(60) NOT NULL,
    "avatarPath" VARCHAR,
    "role" "UserRole" NOT NULL DEFAULT 'NONE',
    "visibility" "ProfileVisibility" NOT NULL DEFAULT 'PUBLIC',
    "displayName" VARCHAR(20),
    "bio" VARCHAR(300),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "PostLike" ADD CONSTRAINT "PostLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "PostLike" ADD CONSTRAINT "PostLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_replyTo_fkey" FOREIGN KEY ("replyTo") REFERENCES "Post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
