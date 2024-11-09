import useCookie from "@/utils/hooks/useCookie";
import {cookiePreferenceStorageName} from "@/utils/prefers-color-scheme";
import * as Toast from "@radix-ui/react-toast";
import {Card} from "@ui/card";
import {useEffect, useState} from "react";
import { Button } from "@ui/button";
import Fade from "@ui/fade";

export default function CookieToast({ initial }: { initial?: string }) {
    const { cookie, setCookie } = useCookie(cookiePreferenceStorageName, { initial });
    const [ elapsed, setElapsed ] = useState<number>(0);

    const duration = 10;
    const interval = 50;
    const progress = elapsed / 1000 / duration * 100;
    const isRendered = cookie == null && progress < 100;

    useEffect(() => {
        const id = setInterval(() => {
            setElapsed(prev => prev + interval);
            if (progress >= 100) clearInterval(interval);
        }, interval);

        return () => clearInterval(id);
    }, [cookie]);

    function onAccept() {
        setCookie('accept');
    }

    function onDecline() {
        setCookie('decline');
    }

    return (
        <Fade show={isRendered}>
            <Toast.Root duration={duration * 1000} asChild>
                <Card className="flex flex-col gap-2 p-3 relative overflow-hidden">
                    <span>We use cookies to store personal preferences.</span>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onAccept}>Accept All</Button>
                        <Button variant="outline" onClick={onDecline}>Decline All</Button>
                    </div>
                    <div className="h-[1px] bg-current absolute left-0 bottom-0 rounded-full" style={{ right: progress + '%' }} />
                </Card>
            </Toast.Root>
        </Fade>
    )
}