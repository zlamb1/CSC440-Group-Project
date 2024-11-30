import NotFound from "@/routes/$";
import {Prisma, ProfileVisibility} from "@prisma/client";
import {ActionFunctionArgs} from "@remix-run/node";
import UnauthorizedResponse from "@/api/UnauthorizedError";
import BadRequestResponse, {RequiredFieldResponse} from "@/api/BadRequestResponse";
import UnknownErrorResponse from "@/api/UnknownErrorResponse";
import {ExplicitResourceNotFoundResponse} from "@/api/ResourceNotFoundResponse";
import {ExplicitDeleteResponse} from "@/api/DeleteResponse";
import {ExplicitCreateResponse} from "@/api/CreateResponse";
import EndpointResponse, {ResponseType} from "@/api/EndpointResponse";

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

      const followRequest = await context.prisma.followRequest.findUnique({
        where: {
          requestorId_requestedId: {
            requestorId: user.id,
            requestedId: context.user.id,
          },
        },
      });

      if (followRequest) {
        await context.prisma.$transaction([
          context.prisma.followRequest.delete({
            where: {
              requestorId_requestedId: {
                requestorId: user.id,
                requestedId: context.user.id,
              },
            },
          }),
          context.prisma.follow.create({
            data: {
              followerId: context.user.id,
              followingId: params.id,
            },
          })
        ]);

        return ExplicitCreateResponse('Follow');
      }

      if (user.visibility !== ProfileVisibility.PUBLIC) {
        const followRequest = await context.prisma.followRequest.findUnique({
          where: {
            requestorId_requestedId: {
              requestorId: user.id,
              requestedId: context.user.id,
            },
          },
        });

        if (!followRequest) {
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

        return ExplicitCreateResponse('Follow');
      }

      await context.prisma.follow.create({
        data: {
          followerId: context.user.id,
          followingId: params.id,
        },
      });

      return ExplicitCreateResponse('Follow');
    } else {
      let followRequest = await context.prisma.followRequest.findUnique({
        where: {
          requestorId_requestedId: {
            requestorId: params.id,
            requestedId: context.user.id,
          },
        },
      });

      try {
        followRequest = await context.prisma.followRequest.delete({
          where: {
            requestorId_requestedId: {
              requestorId: params.id,
              requestedId: context.user.id,
            },
          },
        });
      } catch (err) {
        console.error(err);
      }

      let follow;
      try {
        follow = await context.prisma.follow.delete({
          where: {
            followerId_followingId: {
              followerId: context.user.id,
              followingId: params.id,
            },
          },
        });
      } catch (err) {
        if (!(err instanceof Prisma.PrismaClientKnownRequestError) || err.code !== 'P2025') {
          throw err;
        }
      }

      if (!follow) {
        if (followRequest) {
          return ExplicitDeleteResponse('FollowRequest');
        }
        return ExplicitResourceNotFoundResponse('Follow');
      }

      return ExplicitDeleteResponse('Follow');
    }
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