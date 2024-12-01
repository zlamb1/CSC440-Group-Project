import {ActionFunctionArgs} from "@remix-run/node";
import NotFound from "@/routes/$";
import {ensureContentLength, sanitizeContent} from "@/utils/posts/post-validation";
import UnauthorizedResponse from "@/api/UnauthorizedError";
import {RequiredFieldResponse} from "@/api/BadRequestResponse";
import EndpointResponse from "@/api/EndpointResponse";
import {ExplicitCreateResponse} from "@/api/CreateResponse";
import UnknownErrorResponse from "@/api/UnknownErrorResponse";
import {ExplicitResourceNotFoundResponse} from "@/api/ResourceNotFoundResponse";

export async function action({context, request}: ActionFunctionArgs) {
  try {
    if (!context.user.loggedIn) {
      return UnauthorizedResponse();
    }

    const formData = await request.formData();
    const content = String(formData.get("content"));

    if (!content) {
      return RequiredFieldResponse('Post Content');
    }

    const sanitizedContent = sanitizeContent(content);
    const msg = ensureContentLength(sanitizedContent);
    if (msg) {
      return EndpointResponse(msg, 400);
    }

    const post = await context.prisma.post.create({
      data: {
        userId: context.user.id,
        content: sanitizedContent,
      }
    });

    if (!post) {
      return ExplicitResourceNotFoundResponse('Post');
    }

    // manually set SQL-aggregated fields
    post.replyCount = 0;
    post.likeCount = 0;
    post.liked = null;
    post.user = context.user;

    return ExplicitCreateResponse('Post', {post});
  } catch (err) {
    return UnknownErrorResponse(err);
  }
}

export default NotFound;