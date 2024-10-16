import {ActionFunctionArgs, json} from "@remix-run/node";
import {tryDatabaseAction} from "@/utils/database-error";
import NotFound from "@/routes/$";

export async function action({ context, params, request }: ActionFunctionArgs) {
    return await tryDatabaseAction(async () => {
        const formData = await request.formData();
        const content = String(formData.get('content'));

        if (!params.id) {
            return json({ error: 'Post is required.' });
        }

        if (!context.user?.loggedIn) {
            return json({ error: 'You must be logged in to edit a post.' });
        }

        await context.db.editPost(params.id, content);
        return json({ success: 'edited post' });
    });
}

export default NotFound;