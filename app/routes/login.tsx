import {ActionFunctionArgs, redirect, json, LoaderFunctionArgs} from "@remix-run/node";
import {useSession} from "@/sessions.server";
import LoginForm from "@components/LoginForm";
import {Key, Lock} from "lucide-react";

export async function loader({ context }: LoaderFunctionArgs) {
    if (context.user.loggedIn) {
        return redirect('/');
    } else {
        return null;
    }
}

export async function action({ context, request } : ActionFunctionArgs) {
    try {
        const formData = await request.formData();
        const username = String(formData.get("username"));
        const password = String(formData.get("password"));

        if (!username) {
            return json({
                username: 'Username is required'
            });
        }

        if (!password) {
            return json({
                password: 'Password is required'
            });
        }

        const user = await context.prisma.user.findUnique({
            where: {
                username,
            }
        });

        if (!user) {
            return json({ error: 'Invalid credentials' });
        }

        if (await context.bcrypt.compare(password, user.passwordHash)) {
            const { session } = await useSession(context, request);
            session.set(context.cookieProperty.userID, user.id);
            return redirect('/', {
                headers: {
                    'Set-Cookie': await context.session.commitSession(session)
                }
            })
        } else {
            return json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        console.error(err);
        return json({
            error: 'Unknown error'
        })
    }
}

export default function LoginPortal() {
    return (
        <div className="flex-grow flex gap-32 justify-center">
            <LoginForm header="Sign in to Stories" submit="Log In" icon={<Lock className="text-primary"/>}/>
            <LoginForm header="Register for Stories" submit="Register" icon={<Key className="text-primary"/>}
                       action="/register"/>
        </div>
    )
}