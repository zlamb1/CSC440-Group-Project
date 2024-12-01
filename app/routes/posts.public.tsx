import {LoaderFunctionArgs} from "@remix-run/node";
import UnknownErrorResponse from "@/api/UnknownErrorResponse";
import {getPublicPosts} from "@prisma/client/sql";
import EndpointResponse from "@/api/EndpointResponse";

export async function fetchPublicPosts(prisma: any, userId: string, cursor?: string | null, limit?: string | null) {
  return await prisma.$queryRawTyped(getPublicPosts(userId, cursor ? new Date(cursor) : new Date(), limit ? Number(limit) : 5));
}

export async function loader({context, request}: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const cursor = url.searchParams?.get("cursor");
    const limit = url.searchParams?.get("limit");
    const posts = await fetchPublicPosts(context.prisma, context.user.id, cursor, limit);
    return EndpointResponse({posts});
  } catch (err) {
    return UnknownErrorResponse(err);
  }
}