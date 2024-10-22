import {Button} from "@ui/button";
import {Bell} from "lucide-react";
import {Link, useFetcher} from "@remix-run/react";
import React, {useEffect, useState} from "react";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@ui/hover-card";
import Fade from "@ui/fade";
import {LoadingSpinner} from "@components/LoadingSpinner";
import InboxTable from "@components/table/InboxTable";

export default function NotificationNavDropdown({ notificationCount = 0 }: { notificationCount?: number }) {
    const [ isOpen, setIsOpen ] = useState(false);
    const [ notifications, setNotifications ] = useState<any[]>();
    const fetcher = useFetcher();

    useEffect(() => {
        if (fetcher.state === 'idle') {
            setNotifications(fetcher.data);
        }
    }, [fetcher]);

    function getNotifications() {
        fetcher.submit(null, {
            method: 'GET',
            action: '/notifications',
        });
    }

    function onOpen(isOpen: boolean) {
        if (isOpen) {
            getNotifications();
        }
        setIsOpen(isOpen);
    }

    return (
        <HoverCard open={isOpen} onOpenChange={onOpen}>
            <HoverCardTrigger asChild>
                <Link to="/inbox">
                    <Button className="relative" size="icon" variant="ghost">
                        <Bell size={20} />
                        {
                            notificationCount > 0 ?
                                <div
                                    className="bg-primary text-white rounded-full absolute w-[12px] h-[12px] flex justify-center items-center text-[10px] right-[5px] bottom-[5px]">
                                    {notificationCount}
                                </div> : null
                        }
                    </Button>
                </Link>
            </HoverCardTrigger>
            <HoverCardContent className="flex justify-center">
                <Fade show={fetcher.state === 'idle'} fallback={<LoadingSpinner />}>
                    <InboxTable notifications={notifications} filter="" compact />
                </Fade>
            </HoverCardContent>
        </HoverCard>
    );
}