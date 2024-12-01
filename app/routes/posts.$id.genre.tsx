import {ActionFunctionArgs} from "@remix-run/node";
import {PrismaClientKnownRequestError} from "@prisma/client/runtime/library";
import {RequiredFieldResponse} from "@/api/BadRequestResponse";
import UnauthorizedResponse from "@/api/UnauthorizedError";
import {ExplicitDeleteResponse} from "@/api/DeleteResponse";
import {ExplicitCreateResponse} from "@/api/CreateResponse";
import ResourceNotFoundResponse, {ExplicitResourceNotFoundResponse} from "@/api/ResourceNotFoundResponse";
import {AlreadyExistsResponse} from "@/api/ForbiddenResponse";
import UnknownErrorResponse from "@/api/UnknownErrorResponse";
import {Genre} from "@prisma/client";
import EndpointResponse from "@/api/EndpointResponse";

export async function action({context, params, request}: ActionFunctionArgs) {
  try {
    if (!params.id) {
      return RequiredFieldResponse('Post ID');
    }

    if (!context.user.loggedIn) {
      return UnauthorizedResponse();
    }

    const formData = await request.formData();
    const genre = String(formData.get('genre'));
    const _delete = String(formData.get('delete')) === 'true';

    if (!genre) {
      return RequiredFieldResponse('Genre');
    }

    if (!Object.keys(Genre).includes(genre)) {
      return EndpointResponse({error: 'Invalid Genre'});
    }

    const post = await context.prisma.post.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!post) {
      return ResourceNotFoundResponse('Post');
    }

    if (post.userId !== context.user.id) {
      return UnauthorizedResponse();
    }

    if (_delete) {
      const postGenre = await context.prisma.postGenre.delete({
        where: {
          postId_genre: {
            postId: params.id,
            genre
          },
        },
      })

      if (!postGenre) {
        return ExplicitResourceNotFoundResponse('Post Genre');
      }

      return ExplicitDeleteResponse('Post Genre');
    }

    await context.prisma.postGenre.create({
      data: {
        postId: params.id,
        genre
      },
    });

    return ExplicitCreateResponse('Post Genre', {post: params.id, genre});
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError) {
      switch (err.code) {
        case 'P2002':
          return AlreadyExistsResponse('Post Genre');
        case 'P2025':
          return ResourceNotFoundResponse();
      }
    }

    return UnknownErrorResponse(err);
  }
}