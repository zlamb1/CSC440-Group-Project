import {ActionFunctionArgs} from "@remix-run/node";
import UnknownErrorResponse from "@/api/UnknownErrorResponse";
import BadRequestResponse, {RequiredFieldResponse} from "@/api/BadRequestResponse";
import UnauthorizedResponse from "@/api/UnauthorizedError";
import {ExplicitResourceNotFoundResponse} from "@/api/ResourceNotFoundResponse";
import {ExplicitCreateResponse} from "@/api/CreateResponse";

export async function action({context, params, request}: ActionFunctionArgs) {
  try {
    if (!context.user.loggedIn) {
      return UnauthorizedResponse();
    }

    const formData = await request.formData();
    const description = String(formData.get('description'));

    if (!params.id) {
      return RequiredFieldResponse('Post ID');
    }

    if (!description) {
      return RequiredFieldResponse('Report Description');
    }

    if (description.length > 200) {
      return BadRequestResponse('Report Description Must Be Less Than 200 Characters');
    }

    const post = await context.prisma.post.findUnique({
      where: {
        id: params.id
      },
    });

    if (!post) {
      return ExplicitResourceNotFoundResponse('Post');
    }

    if (post.userId === context.user.id) {
      return BadRequestResponse('You Cannot Report Your Own Post!');
    }

    await context.prisma.postReport.create({
      data: {
        postId: post.id,
        userId: context.user.id,
        description
      },
    });

    return ExplicitCreateResponse('Report');
  } catch (err) {
    return UnknownErrorResponse(err);
  }
}