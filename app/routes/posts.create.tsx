import {ActionFunctionArgs, json} from "@remix-run/node";
import {tryDatabaseAction} from "@/utils/database-error";

export async function action({context, request}: ActionFunctionArgs) {
    return await tryDatabaseAction(async () => {
        if (!context.user.loggedIn) {
            return json({
                error: 'You must be logged in to post.'
            });
        }

        const formData = await request.formData();
        const content = String(formData.get("content"));

        await context.db.createPost(context.user.id, content);
        return json({ success: 'created post' });
    });
}