import {LoaderFunctionArgs} from "@remix-run/node";
import {RequiredFieldResponse} from "@/api/BadRequestResponse";
import {ExplicitResourceNotFoundResponse} from "@/api/ResourceNotFoundResponse";
import EndpointResponse from "@/api/EndpointResponse";
import UnknownErrorResponse from "@/api/UnknownErrorResponse";

/**
 * Get public information about a user.
 * @param context
 * @param params
 */

export async function loader({ context, params }: LoaderFunctionArgs) {
    try {
        if (!params.username) {
            return RequiredFieldResponse('Username');
        }

        const stdProps = {
            id: true,
            userName: true,
            joinedAt: true,
            avatarPath: true,
            role: true,
            visibility: true,
            displayName: true,
        }

        const user = await context.prisma.user.findUnique({
            select: {
                ...stdProps,
            },
            where: {
                userName: params.username,
            },
        });

        if (!user) {
            return ExplicitResourceNotFoundResponse('User');
        }

        return EndpointResponse({ user });
    } catch (err) {
        return UnknownErrorResponse(err);
    }
}