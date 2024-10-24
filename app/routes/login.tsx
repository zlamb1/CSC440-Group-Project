import {ActionFunctionArgs, redirect, json, LoaderFunctionArgs} from "@remix-run/node";
import {useSession} from "@/sessions.server";
import LoginForm from "@components/LoginForm";
import {Key, Lock} from "lucide-react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@ui/tabs";
import {LayoutGroup, motion} from "framer-motion";

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
        const userName = String(formData.get("username"));
        const passWord = String(formData.get("password"));

        if (!userName) {
            return json({
                username: 'Username is required'
            });
        }

        if (!passWord) {
            return json({
                password: 'Password is required'
            });
        }

        const user = await context.prisma.user.findUnique({
            where: {
                userName,
            }
        });

        if (!user) {
            return json({ password: 'Invalid credentials' });
        }

        if (await context.bcrypt.compare(passWord, user.passwordHash)) {
            const { session } = await useSession(context, request);
            session.set(context.cookieProperty.userID, user.id);
            return redirect('/', {
                headers: {
                    'Set-Cookie': await context.session.commitSession(session)
                }
            })
        } else {
            return json({ password: 'Invalid credentials' });
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
            <Tabs className="flex flex-col items-center gap-4 mt-16" defaultValue="login">
                <TabsList className="flex justify-center w-fit">
                    <LayoutGroup id="tabs">
                        <TabsTrigger value="login">
                            Log In
                        </TabsTrigger>
                        <TabsTrigger value="register">
                            Register
                        </TabsTrigger>
                    </LayoutGroup>
                </TabsList>
                <TabsContent value="login">
                    <LoginForm header="Sign in to Stories" submit="Log In" icon={<Lock className="text-primary"/>} />
                </TabsContent>
                <TabsContent value="register">
                    <LoginForm header="Register for Stories" submit="Register" icon={<Key className="text-primary"/>} action="/register" />
                </TabsContent>
            </Tabs>
        </div>
    )
}