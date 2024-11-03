import NotFound from "@/routes/$";
import { Prisma } from "@prisma/client";
import {ActionFunctionArgs} from "@remix-run/node";
import UnauthorizedResponse from "@/api/UnauthorizedError";
import {RequiredFieldResponse} from "@/api/BadRequestResponse";
import {ExplicitUpdateResponse} from "@/api/UpdateResponse";
import UnknownErrorResponse from "@/api/UnknownErrorResponse";
import {ExplicitResourceNotFoundResponse} from "@/api/ResourceNotFoundResponse";

export async function action({ context, request, params }: ActionFunctionArgs) {
    try {
        if (!context.user.loggedIn) {
            return UnauthorizedResponse();
        }

        const formData = await request.formData();
        const follow = String(formData.get('follow')) === 'true';

        if (!params.id) {
            return RequiredFieldResponse('User ID');
        }

        if (follow) {
            await context.prisma.follow.create({
                data: {
                    followerId: context.user.id,
                    followingId: params.id,
                },
            });
        } else {
            await context.prisma.follow.delete({
                where: {
                    followerId_followingId: {
                        followerId: context.user.id,
                        followingId: params.id,
                    },
                },
            });
        }

        return ExplicitUpdateResponse('Follow');
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === 'P2025') {
                return ExplicitResourceNotFoundResponse('Follow');
            }
        }

        return UnknownErrorResponse(err);
    }
}

export default NotFound;