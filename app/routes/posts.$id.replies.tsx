import {json, LoaderFunctionArgs} from "@remix-run/node";
import {getReplies} from '@prisma/client/sql';

export async function loader({ context, params }: LoaderFunctionArgs) {
    try {
        if (!params.id) {
            return json({ error: 'Post ID is required' });
        }

        const replies = await context.prisma.$queryRawTyped(getReplies(params.id, context.user.id));

        return json({ replies });
    } catch (err) {
        console.error(err);
        return json({ error: 'Unknown error' });
    }
}