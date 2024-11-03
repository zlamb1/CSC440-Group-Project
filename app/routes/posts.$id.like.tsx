import {ActionFunctionArgs} from "@remix-run/node";
import NotFound from "@/routes/$";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import {RequiredFieldResponse} from "@/api/BadRequestResponse";
import UnauthorizedResponse from "@/api/UnauthorizedError";
import {ExplicitDeleteResponse} from "@/api/DeleteResponse";
import {ExplicitCreateResponse} from "@/api/CreateResponse";
import ResourceNotFoundResponse from "@/api/ResourceNotFoundResponse";
import {AlreadyExistsResponse} from "@/api/ForbiddenResponse";
import UnknownErrorResponse from "@/api/UnknownErrorResponse";

export async function action({ context, params, request }: ActionFunctionArgs) {
    try {
        if (!params.id) {
            return RequiredFieldResponse('Post ID');
        }

        if (!context.user.loggedIn) {
            return UnauthorizedResponse();
        }

        const formData = await request.formData();
        const likedString = String(formData.get('liked'));

        if (likedString === 'null') {
            await context.prisma.$transaction([
                context.prisma.postLike.delete({
                    where: {
                        postId_userId: {
                            postId: params.id,
                            userId: context.user.id,
                        },
                    },
                }),
            ]);

            return ExplicitDeleteResponse('Post Like');
        }

        const liked = likedString === 'true';

        await context.prisma.$transaction([
            context.prisma.postLike.upsert({
                where: {
                    postId_userId: {
                        postId: params.id,
                        userId: context.user.id,
                    },
                },
                update: {
                    liked,
                    likedAt: new Date(),
                },
                create: {
                    postId: params.id,
                    userId: context.user.id,
                    liked
                },
            }),
        ]);

        return ExplicitCreateResponse('Post Like');
    } catch (err) {
        if (err instanceof PrismaClientKnownRequestError) {
            switch (err.code) {
                case 'P2002':
                    return AlreadyExistsResponse('Post Like');
                case 'P2025':
                    return ResourceNotFoundResponse();
            }
        }

        return UnknownErrorResponse(err);
    }
}

export default NotFound;