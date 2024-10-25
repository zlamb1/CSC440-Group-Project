import NotFound from "@/routes/$";
import {ActionFunctionArgs, json} from "@remix-run/node";

export async function action({ context, request, params }: ActionFunctionArgs) {
    try {
        const formData = await request.formData();
        const follow = String(formData.get('follow')) === 'true';

        if (!params.id) {
            return json({ error: 'User ID is required' });
        }

        if (!context.user.loggedIn) {
            return json({ error: 'You must be logged in to follow a user' });
        }

        if (follow) {
            await context.prisma.follow.create({
                data: {
                    followerId: context.user.id,
                    followingId: params.id,
                },
            });
        } else {
            await context.prisma.follow.delete({
                where: {
                    followerId: context.user.id,
                    followingId: params.id,
                },
            });
        }

        return json({ success: 'Updated follow' });
    } catch (err) {
        console.error(err);
        return json({ error: 'Unknown error' });
    }
}

export default NotFound;