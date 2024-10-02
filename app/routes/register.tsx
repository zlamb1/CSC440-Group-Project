import {ActionFunctionArgs, json, redirect, TypedResponse} from "@remix-run/node";
import {useRegisterValidation} from "@/login.util.server";

export async function action(args: ActionFunctionArgs) {
    return await useRegisterValidation(args, async (username, password) => {
        try {
            const session = await args.context.session.getSession();
            session.set('userId', await args.context.user.createUser(username, password));
            return redirect('/', {
                headers: {
                    'Set-Cookie': await args.context.session.commitSession(session)
                }
            });
        } catch (err) {
            console.error('Failed to create user: ' + err);
            return json({ err: 'unknown error' });
        }
    });
}