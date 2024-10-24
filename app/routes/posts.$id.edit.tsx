import {ActionFunctionArgs, json} from "@remix-run/node";
import NotFound from "@/routes/$";
import {ensureContentLength, sanitizeContent} from "@/utils/post-validation";

export async function action({ context, params, request }: ActionFunctionArgs) {
    try {
        const formData = await request.formData();
        const content = String(formData.get('content'));

        if (!params.id) {
            return json({ error: 'Post is required' });
        }

        if (!context.user.loggedIn) {
            return json({ error: 'You must be logged in to edit a post' });
        }

        if (!content) {
            return json({ error: 'Post content is required' });
        }

        const sanitizedContent = sanitizeContent(content);
        const msg = ensureContentLength(sanitizedContent);
        if (msg) {
            return json({ error: msg });
        }

        const post = await context.prisma.post.update({
            data: {
                content: sanitizedContent,
                lastEdited: new Date(),
            },
            where: {
                id: params.id,
                userId: context.user.id,
            }
        });

        if (!post) {
            return json({ error: 'Post not found' });
        }

        return json({ success: 'Updated post' });
    } catch (err) {
        console.error(err);
        return json({ error: 'Unknown error' });
    }
}

export default NotFound;