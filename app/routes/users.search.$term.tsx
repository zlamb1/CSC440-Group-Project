import NotFound from "@/routes/$";
import {json, LoaderFunctionArgs} from "@remix-run/node";

export async function loader({ context, params }: LoaderFunctionArgs) {
    try {
        if (!params.term) {
            return json({ error: 'Search term is required.' });
        }

        const users = await context.prisma.user.findMany({
            select: {
                userName: true,
                avatarPath: true,
                displayName: true,
            },
            where: {
                userName: {
                    contains: params.term,
                    mode: 'insensitive'
                }
            }
        });

        return json({ users });
    } catch (err) {
        console.error(err);
        return json({ error: 'Unknown error.' });
    }
}

export default NotFound;