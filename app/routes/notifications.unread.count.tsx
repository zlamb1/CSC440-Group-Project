import {LoaderFunctionArgs} from "@remix-run/node";
import UnknownErrorResponse from "@/api/UnknownErrorResponse";
import UnauthorizedResponse from "@/api/UnauthorizedError";
import {ExplicitResourceNotFoundResponse} from "@/api/ResourceNotFoundResponse";
import EndpointResponse from "@/api/EndpointResponse";
import {Notification} from "@prisma/client";

export async function loader({ context }: LoaderFunctionArgs) {
    try {
        if (!context.user.loggedIn) {
            return UnauthorizedResponse();
        }

        const notifications = await context.prisma.notification.findMany({
            where: {
                userId: context.user.id,
            },
        });

        if (!notifications) {
            return ExplicitResourceNotFoundResponse("Notifications");
        }

        const unreadCount = notifications?.reduce((count: number, notification: Notification) => (notification.viewed ? 0 : 1) + count ) ?? 0;

        return EndpointResponse({ unread: unreadCount });
    } catch (err) {
        return UnknownErrorResponse(err);
    }
}