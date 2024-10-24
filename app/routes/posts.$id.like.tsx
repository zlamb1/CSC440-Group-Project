import {ActionFunctionArgs, json} from "@remix-run/node";
import NotFound from "@/routes/$";
import {PostLike} from "@prisma/client";

export async function action({ context, params, request }: ActionFunctionArgs) {
    try {
        if (!params.id) {
            return json({ error: 'Post ID is required' });
        }

        if (!context.user.loggedIn) {
            return json({ error: 'You must be logged in to react to a post' });
        }

        const formData = await request.formData();
        const likedString = String(formData.get('liked'));

        const oldLike: PostLike = await context.prisma.postLike.findUnique({
            where: {
                postId_userId: {
                    postId: params.id,
                    userId: context.user.id,
                },
            }
        });

        if (likedString === 'null') {
            await context.prisma.$transaction([
                context.prisma.post.update({
                    data: {
                        likeCount: {
                            increment: oldLike ? (oldLike.liked ? -1 : 1) : 0,
                        },
                    },
                    where: {
                        id: params.id,
                    },
                }),
                context.prisma.postLike.delete({
                    where: {
                        postId_userId: {
                            postId: params.id,
                            userId: context.user.id,
                        },
                    },
                }),
            ]);

            return json({ success: 'Deleted liked' });
        }

        const liked = likedString === 'true';

        if (oldLike && oldLike.liked === liked) {
            return json({ error: 'Post like state has not changed' });
        }

        await context.prisma.$transaction([
            context.prisma.postLike.upsert({
                where: {
                    postId_userId: {
                        postId: params.id,
                        userId: context.user.id,
                    },
                },
                update: {
                    liked,
                    likedAt: new Date(),
                },
                create: {
                    postId: params.id,
                    userId: context.user.id,
                },
            }),
            context.prisma.post.update({
                data: {
                    likeCount: {
                        increment: (liked ? 1 : -1) * (oldLike ? 2 : 1),
                    }
                },
                where: {
                    id: params.id,
                },
            }),
        ]);

        return json({ success: 'Created post like' });
    } catch (err) {
        console.error(err);
        return json({ error: 'Unknown error' });
    }
}

export default NotFound;