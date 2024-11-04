import {LoaderFunctionArgs} from "@remix-run/node";
import UnknownErrorResponse from "@/api/UnknownErrorResponse";
import {getPublicPosts} from "@prisma/client/sql";
import EndpointResponse from "@/api/EndpointResponse";

export async function loader({ context, request }: LoaderFunctionArgs) {
    try {
        const url = new URL(request.url);
        const cursor = url.searchParams.get("cursor");
        const limit = url.searchParams.get("limit");

        const posts = await context.prisma.$queryRawTyped(
            getPublicPosts(context.user.id, cursor ? new Date(cursor) : new Date(), limit ? Number(limit) : 1)
        );

        return EndpointResponse({ posts });
    } catch (err) {
        return UnknownErrorResponse(err);
    }
}