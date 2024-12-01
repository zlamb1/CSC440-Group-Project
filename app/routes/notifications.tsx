import {json, LoaderFunctionArgs} from "@remix-run/node";
import NotFound from "@/routes/$";
import UnknownErrorResponse from "@/api/UnknownErrorResponse";
import UnauthorizedResponse from "@/api/UnauthorizedError";
import {Notification} from "@prisma/client";

export async function fetchNotifications(context: any, userId: string) {
  const notifications = await context.prisma.notification.findMany({
    select: {
      id: true,
      dateIssued: true,
      type: true,
      content: true,
      data: true,
      expiresOn: true,
      userId: true,
      postId: true,
      viewed: true,
    },
    orderBy: {
      dateIssued: 'desc',
    },
    where: {
      userId,
    },
  });

  return notifications?.map((notification: Notification) => ({...notification, id: notification?.id?.toString()}));
}

export async function loader({context}: LoaderFunctionArgs) {
  if (!context.user.loggedIn) {
    return UnauthorizedResponse();
  }

  try {
    return json({notifications: await fetchNotifications(context, context.user.id)});
  } catch (err) {
    return UnknownErrorResponse(err);
  }
}

export default NotFound;