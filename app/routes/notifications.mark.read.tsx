import {ActionFunctionArgs} from "@remix-run/node";
import UnknownErrorResponse from "@/api/UnknownErrorResponse";
import UnauthorizedResponse from "@/api/UnauthorizedError";
import {RequiredFieldResponse} from "@/api/BadRequestResponse";
import {ExplicitUpdateResponse} from "@/api/UpdateResponse";

export async function action({context, request}: ActionFunctionArgs) {
  try {
    if (!context.user.loggedIn) {
      return UnauthorizedResponse();
    }

    const formData = await request.formData();
    const ids = formData.getAll('id');

    if (!ids || !ids.length) {
      return RequiredFieldResponse('Notification ID');
    }

    await context.prisma.notification.updateMany({
      data: {
        viewed: true,
      },
      where: {
        id: {
          in: ids
        }
      }
    });

    return ExplicitUpdateResponse('Notification');
  } catch (err) {
    return UnknownErrorResponse(err);
  }
}