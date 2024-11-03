import {LoaderFunctionArgs} from "@remix-run/node";
import NotFound from "@/routes/$";
import UnknownErrorResponse from "@/api/UnknownErrorResponse";
import UnauthorizedResponse from "@/api/UnauthorizedError";

export async function loader({ context }: LoaderFunctionArgs) {
    if (!context.user.loggedIn) {
        return UnauthorizedResponse();
    }

    try {
        return await context.prisma.notification.findMany({
            orderBy: {
                dateIssued: 'desc',
            },
            where: {
                userId: context.user.id,
            },
        });
    } catch (err) {
        return UnknownErrorResponse(err);
    }
}

export default NotFound;