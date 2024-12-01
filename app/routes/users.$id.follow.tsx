import NotFound from "@/routes/$";
import {Prisma, ProfileVisibility} from "@prisma/client";
import {ActionFunctionArgs} from "@remix-run/node";
import UnauthorizedResponse from "@/api/UnauthorizedError";
import BadRequestResponse, {RequiredFieldResponse} from "@/api/BadRequestResponse";
import UnknownErrorResponse from "@/api/UnknownErrorResponse";
import {ExplicitResourceNotFoundResponse} from "@/api/ResourceNotFoundResponse";
import EndpointResponse, {ResponseType} from "@/api/EndpointResponse";
import {ExplicitCreateResponse} from "@/api/CreateResponse";
import {ExplicitDeleteResponse} from "@/api/DeleteResponse";

export async function action({context, request, params}: ActionFunctionArgs) {
  try {
    if (!context.user.loggedIn) {
      return UnauthorizedResponse();
    }

    const formData = await request.formData();
    const follow = String(formData.get('follow')) === 'true';

    if (!params.id) {
      return RequiredFieldResponse('User ID');
    }

    if (params.id === context.user.id) {
      return BadRequestResponse('You Cannot Follow Yourself!');
    }

    if (follow) {
      const user = await context.prisma.user.findUnique({
        where: {
          id: params.id,
        }
      });

      if (!user) {
        return ExplicitResourceNotFoundResponse('User');
      }

      if (user.visibility !== ProfileVisibility.PUBLIC) {
        await context.prisma.followRequest.create({
          data: {
            requestorId: context.user.id,
            requestedId: user.id,
            notification: {
              create: {
                type: 'follow_request',
                userId: user.id,
                data: JSON.stringify({
                  requestorId: context.user.id,
                  requestedId: user.id
                }),
              },
            },
          },
        });

        return ExplicitCreateResponse('FollowRequest');
      }

      await context.prisma.follow.create({
        data: {
          followerId: context.user.id,
          followingId: params.id,
        },
      });

      return ExplicitCreateResponse('Follow');
    }

    await context.prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: context.user.id,
          followingId: params.id,
        },
      },
    });

    return ExplicitDeleteResponse('Follow');
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      switch (err.code) {
        case 'P2002':
          return EndpointResponse('Follow Already Exists', ResponseType.Conflict);
        case 'P2025':
          return ExplicitResourceNotFoundResponse('Follow');
      }
    }

    return UnknownErrorResponse(err);
  }
}

export default NotFound;