import {json, LoaderFunctionArgs} from "@remix-run/node";

export async function loader({ context, params }: LoaderFunctionArgs) {
    try {
        if (!params.id) {
            return json({ error: 'Post ID is required' });
        }

        const replies = await context.prisma.post.findMany({
            orderBy: {
                postedAt: 'desc',
            },
            include: {
                user: true,
            },
            where: {
                replyTo: params.id,
            },
        });

        return json({ replies });
    } catch (err) {
        console.error(err);
        return json({ error: 'Unknown error' });
    }
}