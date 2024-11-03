import {ActionFunctionArgs, json} from "@remix-run/node";
import NotFound from "@/routes/$";
import {ensureContentLength, sanitizeContent} from "@/utils/post-validation";

export async function action({ context, params, request }: ActionFunctionArgs) {
    try {
        const formData = await request.formData();
        const content = String(formData.get('content'));

        if (!params.id) {
            return json({ error: 'Post ID is required' });
        }

        if (!context.user.loggedIn) {
            return json({ error: 'You must be logged in to reply to a post' });
        }

        if (!content) {
            return json({ error: 'Post content is required' });
        }

        const sanitizedContent = sanitizeContent(content);
        const msg = ensureContentLength(sanitizedContent);
        if (msg) {
            return json({ error: msg });
        }

        await context.prisma.post.create({
            data: {
                user: {
                    connect: {
                        id: context.user.id,
                    },
                },
                content: sanitizedContent,
                post: {
                    connect: {
                        id: params.id,
                    },
                },
            },
        });

        return json({ success: 'Created reply' });
    } catch (err) {
        console.error(err);
        return json({ error: 'Unknown error' });
    }
}

export default NotFound;