import NotFound from "@/routes/$";
import {Prisma, ProfileVisibility} from "@prisma/client";
import {ActionFunctionArgs} from "@remix-run/node";
import UnauthorizedResponse from "@/api/UnauthorizedError";
import BadRequestResponse, {RequiredFieldResponse} from "@/api/BadRequestResponse";
import UnknownErrorResponse from "@/api/UnknownErrorResponse";
import {ExplicitResourceNotFoundResponse} from "@/api/ResourceNotFoundResponse";
import {ExplicitDeleteResponse} from "@/api/DeleteResponse";
import {ExplicitCreateResponse} from "@/api/CreateResponse";

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
        const data = {
          requestorId: context.user.id,
          requestedId: user.id
        }

        await context.prisma.$transaction([
          context.prisma.followRequest.create({
            data
          }),
          context.prisma.notification.create({
            data: {
              data: JSON.stringify(data),
              userId: user.id,
              type: 'follow_request',
            },
          })
        ]);

        return ExplicitCreateResponse('FollowRequest');
      }

      await context.prisma.follow.create({
        data: {
          followerId: context.user.id,
          followingId: params.id,
        },
      });

      return ExplicitCreateResponse('Follow');
    } else {
      const follow = await context.prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: context.user.id,
            followingId: params.id,
          },
        },
      });

      if (!follow) {
        return ExplicitResourceNotFoundResponse('Follow');
      }

      return ExplicitDeleteResponse('Follow');
    }
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