import {ActionFunctionArgs, json} from "@remix-run/node";

export async function action({ context, params }: ActionFunctionArgs) {
    if (!context.user.loggedIn) {
        return json({
            error: 'You must be logged in to post.'
        });
    }

    try {
        await context.db.deletePost(context.user.id, params.id);
        return json({});
    } catch (err) {
        return json({error: 'unknown error'});
    }
}