import {User} from "@prisma/client";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@ui/hover-card";
import { ReactNode } from "react";
import UserAvatar from "@components/UserAvatar";
import {UserWithLoggedIn} from "@/utils/types";
import {Button} from "@ui/button";
import {Form} from "@remix-run/react";

function getFormattedDate(date: Date) {
    if (!date) {
        return null;
    } else {
        date = new Date(date);
    }

    const months = [
        "January", "February", "March", "April", "May", "June", "July", "August",
        "September", "October", "November", "December"
    ]

    return (
        months[date.getMonth()] + ", " + date.getFullYear()
    );
}

export default function UserHoverCard({ viewer, user, children }: { viewer: UserWithLoggedIn, user: User | null, children: ReactNode }) {
    if (!user) {
        return children;
    }

    return (
        <HoverCard>
            <HoverCardTrigger asChild>
                {children}
            </HoverCardTrigger>
            <HoverCardContent className="flex flex-row min-w-fit gap-2">
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center gap-12">
                        <div className="flex gap-2">
                            <UserAvatar avatar={user.avatarPath} userName={user.userName} />
                            {
                                user.displayName ?
                                    <div className="flex items-center gap-1">
                                        <span className="font-bold">{user.displayName}</span>
                                        <span className="text-sm text-gray-400">@{user.userName}</span>
                                    </div> : <span className="font-bold">@{user.userName}</span>
                            }
                        </div>
                        <Form navigate={false} method="POST" action={`/users/${user.id}/follow`}>
                            <input className="hidden" value="true" name="follow" readOnly />
                            <Button>Follow</Button>
                        </Form>
                    </div>
                    <div className="text-sm dark:text-gray-300">
                        Joined {getFormattedDate(user.joinedAt)}
                    </div>
                </div>
            </HoverCardContent>
        </HoverCard>
    );
}