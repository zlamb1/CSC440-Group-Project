import {ActionFunctionArgs, redirect} from "@remix-run/node";
import {useSession} from "@/utils/hooks/useSession.server";

export async function action({context, request}: ActionFunctionArgs) {
    if (!context.user.loggedIn) {
        return redirect("/");
    }

    const { session } = await useSession(context, request);
    return redirect("/", {
        headers: {
            'Set-Cookie': await context.session.destroySession(session)
        }
    });
}