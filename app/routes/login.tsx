import {Card} from "@ui/card";
import {Form, Link, useNavigation} from "@remix-run/react";
import {Input} from "@ui/input";
import {Label} from "@ui/label";
import {Button} from "@ui/button";
import {ActionFunctionArgs, redirect} from "@remix-run/node";
import {SVGProps} from "react";
import {cn} from "@/lib/utils";
import {Key} from "lucide-react";

export async function action({request}: ActionFunctionArgs) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    return redirect('/');
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

export default function LoginPortal() {
    const navigation = useNavigation();
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
                            <Input type="text" id="username" required />
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Link className="text-[0.7rem] text-blue-500 hover:underline" to="/forgot-password">Forgot password?</Link>
                            </div>
                            <Input type="password" id="password" required />
                        </div>
                        <Button className="w-full">
                            {navigation.state === 'submitting' ? <LoadingSpinner /> : 'Log In'}
                        </Button>
                    </fieldset>
                </Form>
            </Card>
        </div>
    )
}