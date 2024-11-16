import {ActionFunctionArgs, redirect, LoaderFunctionArgs} from "@remix-run/node";
import {useSession} from "@/utils/hooks/useSession.server";
import LoginForm from "@components/LoginForm";
import {Key, Lock} from "lucide-react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@ui/tabs";
import {LayoutGroup} from "framer-motion";
import {RequiredFieldResponse} from "@/api/BadRequestResponse";
import UnknownErrorResponse from "@/api/UnknownErrorResponse";
import EndpointResponse, {ResponseType} from "@/api/EndpointResponse";
import RegisterForm from "@components/RegisterForm";

export async function loader({ context }: LoaderFunctionArgs) {
    if (context.user.loggedIn) {
        return redirect('/');
    }

    return null;
}

export async function action({ context, request } : ActionFunctionArgs) {
    try {
        const formData = await request.formData();
        const userName = String(formData.get("username"));
        const passWord = String(formData.get("password"));

        if (!userName) {
            return RequiredFieldResponse('Username', true);
        }

        if (!passWord) {
            return RequiredFieldResponse('Password', true);
        }

        const user = await context.prisma.user.findUnique({
            where: {
                userName,
            }
        });

        if (!user) {
            return EndpointResponse({ password: 'Invalid Credentials' }, ResponseType.BadRequest);
        }

        if (await context.bcrypt.compare(passWord, user.passwordHash)) {
            const { session } = await useSession(context, request);
            session.set(context.cookieProperty.userID, user.id);
            return redirect('/', {
                headers: {
                    'Set-Cookie': await context.session.commitSession(session)
                }
            })
        }

        return EndpointResponse({ password: 'Invalid Credentials' }, ResponseType.BadRequest);
    } catch (err) {
        return UnknownErrorResponse(err);
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
                    <LoginForm />
                </TabsContent>
                <TabsContent value="register">
                    <RegisterForm />
                </TabsContent>
            </Tabs>
        </div>
    )
}