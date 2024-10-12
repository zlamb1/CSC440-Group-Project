import {ActionFunctionArgs, json} from "@remix-run/node";

export async function action({context, request}: ActionFunctionArgs) {
    if (!context.user.loggedIn) {
        return json({
            error: 'You must be logged in to post.'
        });
    }

    const formData = await request.formData();
    const postId = String(formData.get("id"));

    if (!postId) {
        return json({ id: 'Post ID is required.' });
    }

    const post = await context.db.getPost(postId);
    if (post.posterId !== context.user.id) {
        return json({ error: 'You cannot delete a post you did not create.' });
    }

    try {
        await context.db.deletePost(context.user.id, postId);
        return json({});
    } catch (err) {
        return json({error: 'unknown error'});
    }
}