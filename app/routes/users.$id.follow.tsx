import NotFound from "@/routes/$";
import { Prisma } from "@prisma/client";
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
                    followerId_followingId: {
                        followerId: context.user.id,
                        followingId: params.id,
                    },
                },
            });
        }

        return json({ success: 'Updated follow' });
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === 'P2025') {
                return json({ error: 'Follow not found' });
            }
        }

        console.error(err);
        return json({ error: 'Unknown error' });
    }
}

export default NotFound;