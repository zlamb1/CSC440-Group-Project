import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@ui/alert-dialog";
import React, {ReactNode, useContext, useEffect, useState} from "react";
import {User} from "@prisma/client";
import {useFetcher} from "@remix-run/react";
import {Label} from "@ui/label";
import {Input} from "@ui/input";
import Fade from "@ui/fade";
import {ErrorContext} from "@components/error/ErrorContext";
import {Button} from "@ui/button";
import {cn} from "@/lib/utils";
import {LoadingSpinner} from "@components/LoadingSpinner";
import {UserContext} from "@/utils/context/UserContext";

function UserDeletionForm({ user, onCancel }: { user: User, onCancel?: () => void }) {
    const fetcher = useFetcher();

    return (
        <>
            <AlertDialogHeader>
                <AlertDialogTitle>Enter Your Details</AlertDialogTitle>
                <AlertDialogDescription>
                    Enter your account details in order to validate your account deletion.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <fetcher.Form action="/users/delete" method="POST" className="flex flex-col gap-2 mt-3">
                <Label className="flex flex-col gap-1">
                    Username
                    <Input name="userName" placeholder={user.userName} required />
                    <ErrorContext msg={fetcher.data?.username} />
                </Label>
                <Label className="flex flex-col gap-1">
                    Password
                    <Input name="passWord" type="password" placeholder="Re-enter Password" required />
                    <ErrorContext msg={fetcher.data?.password} />
                </Label>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
                    <Button className="min-w-[80px]" type="submit">
                        { fetcher.state === 'idle' ? 'Submit' : <LoadingSpinner /> }
                    </Button>
                </AlertDialogFooter>
            </fetcher.Form>
        </>
    )
}

function UserDeletionConfirmation({ onContinue }: { onContinue: () => void }) {
    function onClick(evt: React.MouseEvent<HTMLButtonElement>) {
        evt.preventDefault();
        onContinue();
    }

    return (
        <>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove your data from our servers.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onClick}>Continue</AlertDialogAction>
            </AlertDialogFooter>
        </>
    )
}

export default function UserDeletionDialog({ children }: { children: ReactNode }) {
    const user = useContext(UserContext);
    const [ stage, setStage ] = useState(0);
    const [ isOpen, setIsOpen ] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setStage(0);
        }
    }, [isOpen])

    if (!user) {
        return null;
    }

    function getStageClasses() {
        if (stage) {
            return 'left-[50%] right-0';
        }

        return 'left-0 right-[50%]';
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                { children }
            </AlertDialogTrigger>
            <AlertDialogContent>
                <Fade show={!!stage} fallback={<UserDeletionConfirmation onContinue={() => setStage(1)} />}>
                    <UserDeletionForm user={user} />
                </Fade>
                <div className="w-full h-[3px] bg-secondary relative rounded-full">
                    <div className={cn("h-full absolute bg-primary rounded-full", getStageClasses())} style={{ transition: 'all 0.3s ease-in-out' }} />
                </div>
            </AlertDialogContent>
        </AlertDialog>
    )
}