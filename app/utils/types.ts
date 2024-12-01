import {Prisma} from "@prisma/client";

export type UserWithFollowers = Prisma.UserGetPayload<{
  include: {
    followers: true
  }
}>

export type UserWithLoggedIn = Prisma.UserGetPayload<{
  include: {
    sentRequests: true,
    following: {
      include: {
        following: true,
      },
    },
  },
}> & { loggedIn: boolean }

export type FollowWithFollowing = Prisma.FollowGetPayload<{ include: { following: true } }>;
export type FollowWithRelations = Prisma.FollowGetPayload<{ include: { following: true, follower: true } }>;

export type PostWithUser = Prisma.PostGetPayload<{
  include: {
    user: true,
  },
}> & { liked: boolean | null, likeCount: number, replyCount: number, genres: string[] };

export type PostWithReplies = PostWithUser & { replies: string[] | null };
export type PostWithRelations = PostWithUser & { replies: PostWithUser[] };