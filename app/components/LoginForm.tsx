import {Card} from "@ui/card";
import {useFetcher} from "@remix-run/react";
import {Label} from "@ui/label";
import {Input} from "@ui/input";
import {ErrorContext} from "@components/ErrorContext";
import {Button} from "@ui/button";
import {LoadingSpinner} from "@components/LoadingSpinner";
import {ReactNode} from "react";

export interface LoginFormProps {
    header: string;
    submit: string;
    icon: ReactNode;
    action?: string;
}

export default function LoginForm({ header, submit, icon, action }: LoginFormProps) {
    const fetcher = useFetcher<{ errors?: any }>();
    return (
        <div className="flex flex-col gap-3 items-center mt-16">
            <div className="border-4 border-primary p-2 rounded-full">
                {icon}
            </div>
            <span className="text-2xl font-medium select-none">
                {header}
            </span>
            <Card className="text-card-foreground">
                <fetcher.Form action={action} className="p-4" method="post">
                    <fieldset className="flex flex-col gap-5" disabled={fetcher.state === 'submitting'}>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="username">Username</Label>
                            <Input type="text" id="username" name="username" autoComplete="off"/>
                            <ErrorContext msg={fetcher.data?.errors.username}/>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center gap-2">
                                <Label htmlFor="password">Password</Label>
                            </div>
                            <Input type="password" id="password" name="password" />
                            <ErrorContext msg={fetcher.data?.errors.password}/>
                        </div>
                        <Button type="submit" className="w-full">
                            {fetcher.state === 'submitting' ? <LoadingSpinner /> : submit}
                        </Button>
                    </fieldset>
                </fetcher.Form>
            </Card>
        </div>
    );
}