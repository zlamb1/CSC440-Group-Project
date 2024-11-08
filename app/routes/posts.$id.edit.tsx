import {ActionFunctionArgs} from "@remix-run/node";
import NotFound from "@/routes/$";
import {ensureContentLength, sanitizeContent} from "@/utils/post-validation";
import BadRequestResponse, {RequiredFieldResponse} from "@/api/BadRequestResponse";
import UnauthorizedResponse from "@/api/UnauthorizedError";
import UnknownErrorResponse from "@/api/UnknownErrorResponse";
import {ExplicitResourceNotFoundResponse} from "@/api/ResourceNotFoundResponse";
import {ExplicitUpdateResponse} from "@/api/UpdateResponse";
import {getPostByID} from "@prisma/client/sql";

export async function action({ context, params, request }: ActionFunctionArgs) {
    try {
        const formData = await request.formData();
        const content = String(formData.get('content'));

        if (!params.id) {
            return RequiredFieldResponse('Post');
        }

        if (!content) {
            return RequiredFieldResponse('Post Content');
        }

        if (!context.user.loggedIn) {
            return UnauthorizedResponse();
        }

        const sanitizedContent = sanitizeContent(content);
        const msg = ensureContentLength(sanitizedContent);
        if (msg) {
            return BadRequestResponse(msg);
        }

        const post = await context.prisma.post.update({
            data: {
                content: sanitizedContent,
                lastEdited: new Date(),
            },
            where: {
                id: params.id,
                userId: context.user.id,
            }
        });

        if (!post) {
            return ExplicitResourceNotFoundResponse('Post');
        }

        return ExplicitUpdateResponse('Post', { content: post.content, lastEdited: post.lastEdited });
    } catch (err) {
        return UnknownErrorResponse(err);
    }
}

export default NotFound;