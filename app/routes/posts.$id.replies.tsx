import {json, LoaderFunctionArgs} from "@remix-run/node";
import {getReplies} from '@prisma/client/sql';
import {RequiredFieldResponse} from "@/api/BadRequestResponse";
import UnknownErrorResponse from "@/api/UnknownErrorResponse";

export async function loader({ context, params }: LoaderFunctionArgs) {
    try {
        if (!params.id) {
            return RequiredFieldResponse('Post ID');
        }

        const replies = await context.prisma.$queryRawTyped(getReplies(params.id, context.user.id));

        return json({ replies });
    } catch (err) {
        return UnknownErrorResponse(err);
    }
}