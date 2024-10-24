import {ActionFunctionArgs, json} from "@remix-run/node";
import NotFound from "@/routes/$";

export async function action({ context, params }: ActionFunctionArgs) {
    try {
        if (!context.user.loggedIn) {
            return json({ error: 'You must be logged in to delete a post' });
        }

        if (!params.id) {
            return json({ error: 'Post ID required' });
        }

        const [_, post] = await context.prisma.$transaction([
            context.prisma.post.deleteMany({
                where: {
                    replyTo: params.id,
                },
            }),
            context.prisma.post.delete({
                where: {
                    id: params.id,
                },
            }),
        ]);

        if (!post) {
            return json({ error: 'Post not found' });
        }

        return json({ success: 'Deleted post' });
    } catch (err) {
        console.error(err);
        return json({ error: 'Unknown error' });
    }
}

export default NotFound;