import {ActionFunctionArgs, redirect, json, LoaderFunctionArgs, TypedResponse, AppLoadContext} from "@remix-run/node";
import {Key, Lock} from "lucide-react";
import {useSession, useUserData} from "@/sessions.server";
import LoginForm from "@components/LoginForm";
import {useLoginValidation} from "@/login.util.server";

export async function loader({context, request}: LoaderFunctionArgs) {
    const data = await useUserData(context, request);
    if (data.loggedIn) {
        return redirect('/');
    } else {
        return null;
    }
}

export async function action(args: ActionFunctionArgs) {
    return await useLoginValidation(args, async (username, password) => {
        const { validated, userId } = await args.context.user.validateUser(username, password);
        if (validated) {
            const { session } = await useSession(args.context, args.request);
            session.set('userId', userId);
            return redirect('/', {
                headers: {
                    'Set-Cookie': await args.context.session.commitSession(session)
                }
            });
        } else {
            return json({ errors: { password: 'Invalid credentials.' } });
        }
    });
}

export default function LoginPortal() {
    return (
        <div className="mx-8 sm:mx-16 md:mx-32 lg:mx-48 xl:mx-64 flex-grow flex gap-32 justify-center items-center">
            <LoginForm header="Sign in to Stories" submit="Log In" icon={<Lock className="text-primary" />} />
            <span className="font-bold text-lg select-none">--OR--</span>
            <LoginForm header="Register for Stories" submit="Register" icon={<Key className="text-primary" />} action="/register" />
        </div>
    )
}