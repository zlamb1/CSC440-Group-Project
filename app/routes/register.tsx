import {ActionFunctionArgs, json, redirect} from "@remix-run/node";
import {tryDatabaseAction} from "@/utils/database-error";

export async function loader() {
    return json({});
}

export async function action({ context, request }: ActionFunctionArgs) {
    return await tryDatabaseAction(async () => {
        const formData = await request.formData();
        const username = String(formData.get("username"));
        const password = String(formData.get("password"));

        const session = await context.session.getSession();
        const id = await context.db.registerUser(username, password);
        session.set('userId', id);

        return redirect('/', {
            headers: {
                'Set-Cookie': await context.session.commitSession(session)
            }
        });
    });
}