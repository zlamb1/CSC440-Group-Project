import {PostLike, Prisma} from "@prisma/client";

export type UserWithLoggedIn = Prisma.UserGetPayload<{
   include: {
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
}> & { liked: boolean | null, likeCount: number, replyCount: number };

export type PostWithReplies = PostWithUser & { replies: string[] };
export type PostWithRelations = PostWithUser & { replies: PostWithUser[] };