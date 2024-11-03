import {LoaderFunctionArgs} from "@remix-run/node";
import {ProfileVisibility} from "@prisma/client";
import UnknownErrorResponse from "@/api/UnknownErrorResponse";
import {ExplicitResourceNotFoundResponse} from "@/api/ResourceNotFoundResponse";
import {RequiredFieldResponse} from "@/api/BadRequestResponse";
import EndpointResponse from "@/api/EndpointResponse";

export async function loader({ context, params }: LoaderFunctionArgs) {
    try {
        if (!params.id) {
            return RequiredFieldResponse('Post ID');
        }

        const post = await context.prisma.post.findUnique({
            where: {
                id: params.id,
            },
            include: {
                user: {
                    where: {
                        visibility: ProfileVisibility.PUBLIC,
                    },
                },
            },
        });

        if (!post) {
            return ExplicitResourceNotFoundResponse('Post');
        }

        return EndpointResponse({ post });
    } catch (err) {
        return UnknownErrorResponse(err);
    }
}