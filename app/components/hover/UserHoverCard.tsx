import {User} from "@prisma/client";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@ui/hover-card";
import { ReactNode } from "react";
import UserAvatar from "@components/user/UserAvatar";
import {UserWithLoggedIn} from "@/utils/types";
import {Form, Link, useFetcher} from "@remix-run/react";
import Fade from "@ui/fade";
import FollowButton from "@components/FollowButton";

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
    const fetcher = useFetcher();

    if (!user) {
        return children;
    }

    const isSelf = viewer?.id === user.id;
    const isFollowing = viewer?.following?.some(follow => follow.followingId === user?.id)

    return (
        <HoverCard>
            <HoverCardTrigger asChild>
                {children}
            </HoverCardTrigger>
            <HoverCardContent className="flex flex-row w-fit gap-2">
                <div className="flex gap-1 flex-col">
                    <div className="flex justify-between items-center gap-12">
                        <Link to={`/users/${user.userName}`} className="flex gap-2">
                            <UserAvatar avatar={user.avatarPath} userName={user.userName} />
                            {
                                user.displayName ?
                                    <div className="flex items-center gap-1">
                                        <span className="font-bold">{user.displayName}</span>
                                        <span className="text-sm text-gray-400">@{user.userName}</span>
                                    </div> : <span className="font-bold">@{user.userName}</span>
                            }
                        </Link>
                        <Fade show={viewer?.loggedIn && !isSelf}>
                            <FollowButton user={user} isFollowing={isFollowing} />
                        </Fade>
                    </div>
                    <div className="text-sm dark:text-gray-300">
                        Joined {getFormattedDate(user.joinedAt)}
                    </div>
                    {
                        user.bio ?
                            <div className="text-sm dark:text-gray-300">
                                { user.bio }
                            </div> : null
                    }
                </div>
            </HoverCardContent>
        </HoverCard>
    );
}