import {PostLike, Prisma} from "@prisma/client";

export type UserWithLoggedIn = Prisma.UserGetPayload<{
   include: {
       following: true,
   },
}> & { loggedIn: boolean }

export type PostWithUser = Prisma.PostGetPayload<{
    include: {
        user: true,
    },
}> & { postLike?: PostLike };

export type PostWithRelations = Prisma.PostGetPayload<{
    include: {
        user: true,
    },
}> & { replies: PostWithUser[] };