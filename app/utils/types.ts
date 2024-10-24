import {Post, PostLike, Prisma, User} from "@prisma/client";

export type UserWithLoggedIn = User & { loggedIn: boolean }

export type PrismaPost = Post;

export type PostWithUser = Prisma.PostGetPayload<{
    include: {
        user: true,
    }
}> & { postLike?: PostLike };

export type PostWithReplies = Prisma.PostGetPayload<{
    include: {
        replies: true,
    },
}>

export type PostWithRelations = PostWithUser & PostWithReplies;