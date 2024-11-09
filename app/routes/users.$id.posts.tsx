import {LoaderFunctionArgs} from "@remix-run/node";
import {RequiredFieldResponse} from "@/api/BadRequestResponse";
import EndpointResponse from "@/api/EndpointResponse";
import UnknownErrorResponse from "@/api/UnknownErrorResponse";
import {getLikedPosts, getUserPosts} from "@prisma/client/sql";
import {ExplicitResourceNotFoundResponse} from "@/api/ResourceNotFoundResponse";

export async function loader({ context, params, request }: LoaderFunctionArgs) {
    try {
        if (!params.id) {
            return RequiredFieldResponse('User ID');
        }

        const user = await context.prisma.user.findUnique({
            where: {
                id: params.id
            }
        });

        if (!user) {
            return ExplicitResourceNotFoundResponse('User');
        }

        let posts;

        const url = new URL(request.url);
        const cursor = url.searchParams?.get("cursor");
        const limit = url.searchParams?.get("limit");
        const liked = url.searchParams?.get("liked") === 'true';

        if (liked) {
            posts = await context.prisma.$queryRawTyped(getLikedPosts(user.id, context.user.id, cursor ? new Date(cursor) : new Date(), limit ? Number(limit) : 5));
        } else {
            posts = await context.prisma.$queryRawTyped(getUserPosts(user.id, context.user.id, cursor ? new Date(cursor) : new Date(), limit ? Number(limit) : 5));
        }

        return EndpointResponse({ posts });
    } catch (err) {
        return UnknownErrorResponse(err);
    }
}