import {json, LoaderFunctionArgs} from "@remix-run/node";
import NotFound from "@/routes/$";

export async function loader({ context }: LoaderFunctionArgs) {
    if (!context.user.loggedIn) {
        return json({ error: 'You must be logged in to get notifications' });
    }

    try {
        return await context.prisma.notification.findMany({
            orderBy: {
                dateIssued: 'desc',
            },
            where: {
                userId: context.user.id,
            },
        });
    } catch (err) {
        console.error(err);
        return json({ error: 'Unknown error' });
    }
}

export default NotFound;