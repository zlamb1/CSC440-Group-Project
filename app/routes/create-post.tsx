import {ActionFunctionArgs, json} from "@remix-run/node";

export async function action({context, request}: ActionFunctionArgs) {
    const user = context.user.data;
    if (!user.loggedIn) {
        return json({
            error: 'You must be logged in to post.'
        });
    }
    const formData = await request.formData();
    const content = String(formData.get("content"));

    if (!content) {
        return json({ content: 'Post content is required.' });
    }

    if (content.length > 300) {
        return json({ content: 'Post content must be below 300 characters.' });
    }

    try {
        await context.posts.createPost(user, content);
        return json({});
    } catch (err) {
        return json({error: 'unknown error'});
    }
}