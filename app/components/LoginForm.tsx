import {Card} from "@ui/card";
import {useFetcher} from "@remix-run/react";
import {Label} from "@ui/label";
import {Input} from "@ui/input";
import {ErrorContext} from "@components/error/ErrorContext";
import {Button} from "@ui/button";
import {LoadingSpinner} from "@components/LoadingSpinner";
import {Lock} from "lucide-react";
import PasswordInput from "@components/PasswordInput";
import {ChangeEvent, useState} from "react";
import {cn} from "@/lib/utils";

export default function LoginForm({ className }: { className?: string }) {
    const [password, setPassword] = useState<string>('');
    const fetcher = useFetcher();

    function onChange(evt: ChangeEvent<HTMLInputElement>) {
        setPassword(evt?.target?.value);
    }

    return (
        <div className={cn("flex flex-col gap-3 items-center", className)}>
            <div className="border-4 border-primary p-2 rounded-full">
                <Lock className="text-primary"/>
            </div>
            <span className="text-2xl font-medium select-none">
                Sign in to Stories
            </span>
            <Card className="text-card-foreground flex-grow">
                <fetcher.Form action="/login" className="p-4" method="post">
                    <fieldset className="flex flex-col gap-8" disabled={fetcher.state === 'submitting'}>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="username">Username</Label>
                            <Input type="text" id="username" name="username" autoComplete="off"/>
                            { fetcher?.data?.username && <ErrorContext msg={fetcher.data.username} /> }
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center gap-2">
                                <Label htmlFor="password">Password</Label>
                            </div>
                            <PasswordInput id="password" name="password" error={fetcher?.data?.password} password={password} onChange={onChange} useStrength={false} />
                        </div>
                        <Button type="submit" containerClass="w-full" className="w-full">
                            {fetcher.state === 'submitting' ? <LoadingSpinner /> : "Log In"}
                        </Button>
                    </fieldset>
                </fetcher.Form>
            </Card>
        </div>
    );
}