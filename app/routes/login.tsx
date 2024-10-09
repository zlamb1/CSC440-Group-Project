import {ActionFunctionArgs, redirect, json, LoaderFunctionArgs, TypedResponse, AppLoadContext} from "@remix-run/node";
import {Key, Lock} from "lucide-react";
import LoginForm from "@components/LoginForm";
import {useSession} from "@/sessions.server";
import {tryDatabaseAction} from "@/utils/database-error";

export async function loader({context}: LoaderFunctionArgs) {
    if (context.user.loggedIn) {
        return redirect('/');
    } else {
        return null;
    }
}

export async function action({ context, request } : ActionFunctionArgs) {
    return await tryDatabaseAction(async () => {
        const formData = await request.formData();
        const username = String(formData.get("username"));
        const password = String(formData.get("password"));

        const { loggedIn, id } = await context.db.authenticateUser(username, password);
        if (loggedIn) {
            const { session } = await useSession(context, request);
            session.set('userId', id);
            return redirect('/', {
                headers: {
                    'Set-Cookie': await context.session.commitSession(session)
                }
            });
        } else {
            return json({ password: 'Invalid credentials.' });
        }
    });
}

export default function LoginPortal() {
    return (
        <div className="flex-grow flex gap-32 justify-center">
            <LoginForm header="Sign in to Stories" submit="Log In" icon={<Lock className="text-primary" />} />
            <LoginForm header="Register for Stories" submit="Register" icon={<Key className="text-primary" />} action="/register" />
        </div>
    )
}