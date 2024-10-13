import {ActionFunctionArgs, json} from "@remix-run/node";
import {tryDatabaseAction} from "@/utils/database-error";

export async function loader() {
    return json({});
}

export async function action({ context, params }: ActionFunctionArgs) {
    return tryDatabaseAction(async () => {
        if (!context.user.loggedIn) {
            return json({
                error: 'You must be logged in to post.'
            });
        }

        await context.db.deletePost(context.user.id, params.id);
        return json('deleted post');
    });
}