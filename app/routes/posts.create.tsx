import {ActionFunctionArgs, json} from "@remix-run/node";
import NotFound from "@/routes/$";
import {ensureContentLength, sanitizeContent} from "@/utils/post-validation";

export async function action({ context, request} : ActionFunctionArgs) {
    try {
        if (!context.user.loggedIn) {
            return json({ error: 'You must be logged in to post' });
        }

        const formData = await request.formData();
        const content = String(formData.get("content"));

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
                userId: context.user.id,
                content: sanitizedContent,
            }
        });

        return json({ success: 'created post' })
    } catch (err) {
        console.error(err);
        return json({ error: 'Unknown error' });
    }
}

export default NotFound;