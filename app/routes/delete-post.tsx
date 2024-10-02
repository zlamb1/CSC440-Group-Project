import {ActionFunctionArgs, json} from "@remix-run/node";

export async function action({context, request}: ActionFunctionArgs) {
    const user = context.user.data;
    if (!user.loggedIn) {
        return json({
            error: 'You must be logged in to post.'
        });
    }

    const formData = await request.formData();
    const postId = String(formData.get("id"));

    if (!postId) {
        return json({ id: 'Post ID is required.' });
    }

    const post = await context.posts.getPost(postId);
    if (post.poster_id !== user.id) {
        return json({ error: 'You cannot delete a post you did not create.' });
    }

    try {
        await context.posts.deletePost(postId);
        return json({});
    } catch (err) {
        return json({error: 'unknown error'});
    }
}