import {ActionFunctionArgs} from "@remix-run/node";
import NotFound from "@/routes/$";
import UnauthorizedResponse from "@/api/UnauthorizedError";
import {RequiredFieldResponse} from "@/api/BadRequestResponse";
import {ExplicitResourceNotFoundResponse} from "@/api/ResourceNotFoundResponse";
import {ExplicitDeleteResponse} from "@/api/DeleteResponse";
import UnknownErrorResponse from "@/api/UnknownErrorResponse";
import {PrismaClientKnownRequestError} from "@prisma/client/runtime/library";

export async function action({context, params}: ActionFunctionArgs) {
  try {
    if (!context.user.loggedIn) {
      return UnauthorizedResponse();
    }

    if (!params.id) {
      return RequiredFieldResponse('Post ID');
    }

    const post = await context.prisma.post.delete({
      where: {
        id: params.id,
      },
    });

    if (!post) {
      return ExplicitResourceNotFoundResponse('Post');
    }

    return ExplicitDeleteResponse('Post');
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === 'P2025') {
        return ExplicitResourceNotFoundResponse('Post');
      }
    }

    return UnknownErrorResponse(err);
  }
}

export default NotFound;