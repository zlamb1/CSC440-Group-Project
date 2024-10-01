import {Card} from "@ui/card";
import {Form, Link, useActionData, useNavigation} from "@remix-run/react";
import {Input} from "@ui/input";
import {Label} from "@ui/label";
import {Button} from "@ui/button";
import {ActionFunctionArgs, redirect, json} from "@remix-run/node";
import {SVGProps, useEffect, useState} from "react";
import {cn} from "@/lib/utils";
import {Key} from "lucide-react";
import {AnimatePresence, motion} from "framer-motion";

declare module "@remix-run/server-runtime" {
    interface AppLoadContext {
        isUsernameAvailable: (username: string) => Promise<boolean>;
        createUser: (username: string, password: string) => Promise<void>;
    }
}

export async function action({context, request}: ActionFunctionArgs) {
    await new Promise(resolve => setTimeout(resolve, 250));
    const formData = await request.formData();
    const username = String(formData.get("username"));
    const password = String(formData.get("password"));
    const errors: { username?: string, password?: string } = {};
    if (username.length === 0) {
        errors.username = 'Username is required.';
    }
    if (username.length > 25) {
        errors.username = 'Username must be less than 25 characters long.';
    }
    const available = await context.isUsernameAvailable(username);
    if (!available) {
        errors.username = 'That username is unavailable.';
    }
    if (password.length === 0) {
        errors.password = 'Password is required.';
    }
    if (Object.keys(errors).length > 0) {
        const values = Object.fromEntries(formData);
        return json({ values, errors });
    }
    try {
        await context.createUser(username, password);
        return redirect('/');
    } catch (err) {
        console.error('Failed to create user: ' + err);
        return json({ err: 'unknown error' });
    }
}

export interface ISVGProps extends SVGProps<SVGSVGElement> {
    size?: number;
    className?: string;
}

export const LoadingSpinner = ({
       size = 24,
       className,
       ...props
   }: ISVGProps) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            {...props}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("animate-spin", className)}
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
};

interface ErrorContextProps {
    msg?: string;
}

function ErrorContext({msg}: ErrorContextProps) {
    return (
        <AnimatePresence mode="wait">
            <motion.p key={msg} className={`text-red-600 text-xs text-nowrap select-none overflow-hidden`}
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.1 }}>
                {msg}
            </motion.p>
        </AnimatePresence>
    )
}

export default function LoginPortal() {
    const navigation = useNavigation();
    const actionData = useActionData<{ values: any, errors: { username?: string, password?: string } }>();
    return (
        <div className="mx-8 sm:mx-16 md:mx-32 lg:mx-48 xl:mx-64 flex-grow flex flex-col gap-3 items-center mt-16">
            <div className="border-4 border-primary p-2 rounded-full">
                <Key className="text-primary dark:text-" />
            </div>
            <span className="text-2xl font-medium select-none">
                Sign in to Stories
            </span>
            <Card className="text-card-foreground">
                <Form className="p-4" method="post">
                    <fieldset className="flex flex-col gap-5" disabled={navigation.state === 'submitting'}>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="username">Username</Label>
                            <Input type="text" id="username" name="username" defaultValue={actionData?.values.username} autoComplete="off" />
                            <ErrorContext msg={actionData?.errors.username} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Link className="text-[0.7rem] text-blue-500 hover:underline" to="/forgot-password">Forgot password?</Link>
                            </div>
                            <Input type="password" id="password" name="password" defaultValue={actionData?.values.password} />
                            <ErrorContext msg={actionData?.errors.password} />
                        </div>
                        <Button type="submit" className="w-full">
                            {navigation.state === 'submitting' ? <LoadingSpinner /> : 'Log In'}
                        </Button>
                    </fieldset>
                </Form>
            </Card>
        </div>
    )
}