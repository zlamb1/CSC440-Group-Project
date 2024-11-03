import {ActionFunctionArgs} from "@remix-run/node";
import NotFound from "@/routes/$";
import UnauthorizedResponse from "@/api/UnauthorizedError";
import {RequiredFieldResponse} from "@/api/BadRequestResponse";
import {ExplicitResourceNotFoundResponse} from "@/api/ResourceNotFoundResponse";
import {ExplicitDeleteResponse} from "@/api/DeleteResponse";
import UnknownErrorResponse from "@/api/UnknownErrorResponse";

export async function action({ context, params }: ActionFunctionArgs) {
    try {
        if (!context.user.loggedIn) {
            return UnauthorizedResponse();
        }

        if (!params.id) {
            return RequiredFieldResponse('Post ID');
        }

        const [_, post] = await context.prisma.$transaction([
            context.prisma.post.update({
                data: {
                    postLikes: {
                        deleteMany: {},
                    },
                    replies: {
                        deleteMany: {},
                    },
                },
                where: {
                    id: params.id,
                },
            }),
            context.prisma.post.delete({
                where: {
                    id: params.id,
                },
            }),
        ]);

        if (!post) {
            return ExplicitResourceNotFoundResponse('Post');
        }

        return ExplicitDeleteResponse('Post');
    } catch (err) {
        return UnknownErrorResponse(err);
    }
}

export default NotFound;