import {ActionFunctionArgs} from "@remix-run/node";
import UnknownErrorResponse from "@/api/UnknownErrorResponse";
import UnauthorizedResponse from "@/api/UnauthorizedError";
import {RequiredFieldResponse} from "@/api/BadRequestResponse";
import {ExplicitDeleteResponse} from "@/api/DeleteResponse";

export async function action({ context, request }: ActionFunctionArgs) {
    try {
        if (!context.user.loggedIn) {
            return UnauthorizedResponse();
        }

        const formData = await request.formData();
        const ids = formData.getAll('id');

        if (!ids || !ids.length) {
            return RequiredFieldResponse('Notification ID');
        }

        console.log(ids);

        await context.prisma.notification.deleteMany({
            where: {
                id: {
                    in: ids
                }
            }
        });

        return ExplicitDeleteResponse('Notification');
    } catch (err) {
        return UnknownErrorResponse(err);
    }
}