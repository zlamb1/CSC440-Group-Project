import {ActionFunctionArgs, redirect} from "@remix-run/node";
import {useSession} from "@/sessions.server";

export async function action({context, request}: ActionFunctionArgs) {
    const { session } = await useSession(context, request);
    return redirect("/", {
        headers: {
            'Set-Cookie': await context.session.destroySession(session)
        }
    });
}