import {ActionFunctionArgs} from "@remix-run/node";
import NotFound from "@/routes/$";
import {ensureContentLength, sanitizeContent} from "@/utils/post-validation";
import UnknownErrorResponse from "@/api/UnknownErrorResponse";
import {ExplicitCreateResponse} from "@/api/CreateResponse";
import {RequiredFieldResponse} from "@/api/BadRequestResponse";
import UnauthorizedResponse from "@/api/UnauthorizedError";
import EndpointResponse from "@/api/EndpointResponse";

export async function action({ context, params, request }: ActionFunctionArgs) {
    try {
        if (!context.user.loggedIn) {
            return UnauthorizedResponse();
        }

        const formData = await request.formData();
        const content = String(formData.get('content'));

        if (!params.id) {
            return RequiredFieldResponse('Post ID');
        }

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
                replyTo: params.id,
            },
        });

        post.user = context.user;

        return ExplicitCreateResponse('Reply', { post });
    } catch (err) {
        return UnknownErrorResponse(err);
    }
}