import NotFound from "@/routes/$";
import {Prisma} from "@prisma/client";
import {ActionFunctionArgs} from "@remix-run/node";
import UnauthorizedResponse from "@/api/UnauthorizedError";
import {RequiredFieldResponse} from "@/api/BadRequestResponse";
import UnknownErrorResponse from "@/api/UnknownErrorResponse";
import {ExplicitResourceNotFoundResponse} from "@/api/ResourceNotFoundResponse";
import {ExplicitCreateResponse} from "@/api/CreateResponse";
import {ExplicitDeleteResponse} from "@/api/DeleteResponse";

export async function action({context, request, params}: ActionFunctionArgs) {
  try {
    if (!context.user.loggedIn) {
      return UnauthorizedResponse();
    }

    const formData = await request.formData();
    const accept = String(formData.get('accept')) === 'true';

    if (!params.id) {
      return RequiredFieldResponse('User ID');
    }

    await context.prisma.followRequest.delete({
      where: {
        requestorId_requestedId: {
          requestorId: params.id,
          requestedId: context.user.id,
        },
      },
    });

    if (accept) {
      await context.prisma.follow.create({
        data: {
          followerId: params.id,
          followingId: context.user.id,
        },
      });

      return ExplicitCreateResponse('Follow');
    }

    return ExplicitDeleteResponse('FollowRequest');
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      switch (err.code) {
        case 'P2025':
          return ExplicitResourceNotFoundResponse('FollowRequest');
      }
    }

    return UnknownErrorResponse(err);
  }
}

export default NotFound;