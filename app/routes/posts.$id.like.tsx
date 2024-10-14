import {ActionFunctionArgs, json} from "@remix-run/node";
import {tryDatabaseAction} from "@/utils/database-error";
import NotFound from "@/routes/$";

export async function action({ context, params, request }: ActionFunctionArgs) {
    return await tryDatabaseAction(async () => {
        const formData = await request.formData();
        const likedString = String(formData.get('liked'));

        if (likedString === 'null') {
            await context.db.deletePostLike(params.id);
            return json({ success: 'deleted like' });
        }

        const liked = likedString === 'true';

        if (!params.id) {
            return json({ error: 'Post is required.' });
        }

        if (!context.user?.loggedIn) {
            return json({ error: 'You must be logged in to like a post.' });
        }

        await context.db.createPostLike(params.id, liked);
        return json({ success: 'updated like' });
    });
}

export default NotFound;