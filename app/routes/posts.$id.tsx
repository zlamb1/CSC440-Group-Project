import {json, LoaderFunctionArgs} from "@remix-run/node";
import {tryDatabaseAction} from "@/utils/database-error";
import post from "@components/post/Post";
import {ProfileVisibility} from "@prisma/client";

export async function loader({ context, params }: LoaderFunctionArgs) {
    try {
        if (!params.id) {
            return json({ error: 'Post ID is required' });
        }

        const post = await context.prisma.post.findUnique({
            where: {
                id: params.id,
            },
            include: {
                user: {
                    where: {
                        visibility: ProfileVisibility.PUBLIC,
                    },
                },
            },
        });

        if (!post) {
            return json({ error: 'Post not found' });
        }

        return json({ post });
    } catch (err) {
        console.error(err);
        return json({ error: 'Unknown error' });
    }
}