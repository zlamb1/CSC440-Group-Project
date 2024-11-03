import NotFound from "@/routes/$";
import {LoaderFunctionArgs} from "@remix-run/node";
import {RequiredFieldResponse} from "@/api/BadRequestResponse";
import UnknownErrorResponse from "@/api/UnknownErrorResponse";
import EndpointResponse from "@/api/EndpointResponse";

export async function loader({ context, params }: LoaderFunctionArgs) {
    try {
        if (!params.term) {
            return RequiredFieldResponse('Search Term');
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

        return EndpointResponse({ users });
    } catch (err) {
        return UnknownErrorResponse(err);
    }
}

export default NotFound;