import {ActionFunctionArgs, json} from "@remix-run/node";
import NotFound from "@/routes/$";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function action({ context, params, request }: ActionFunctionArgs) {
    try {
        if (!params.id) {
            return json({ error: 'Post ID is required.' });
        }

        if (!context.user.loggedIn) {
            return json({ error: 'You must be logged in to react to a post' });
        }

        const formData = await request.formData();
        const likedString = String(formData.get('liked'));

        if (likedString === 'null') {
            await context.prisma.$transaction([
                context.prisma.postLike.delete({
                    where: {
                        postId_userId: {
                            postId: params.id,
                            userId: context.user.id,
                        },
                    },
                }),
            ]);

            return json({ success: 'Deleted post like.' });
        }

        const liked = likedString === 'true';

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
                    liked
                },
            }),
        ]);

        return json({ success: 'Created post like.' });
    } catch (err) {
        if (err instanceof PrismaClientKnownRequestError) {
            switch (err.code) {
                case 'P2002':
                    return json({ error: 'That post like already exists.' });
                case 'P2025':
                    return json({ error: 'That post like does not exist.' });
            }
        }

        console.error(err);
        return json({ error: 'Unknown error.' });
    }
}

export default NotFound;