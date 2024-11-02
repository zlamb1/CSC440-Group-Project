import {Card} from "@ui/card";
import {Button} from "@ui/button";
import {ChevronLeft} from "lucide-react";
import {Separator} from "@ui/separator";
import {Prisma} from "@prisma/client";
import UserAvatar from "@components/user/UserAvatar";
import React from "react";
import {UserWithLoggedIn} from "@/utils/types";
import {cn} from "@/lib/utils";

export default function FriendPanel({ className, user }: { className?: string, user: UserWithLoggedIn }) {
    if (!user?.loggedIn) {
        return <div className={className} />;
    }

    const following = user?.following;

    return (
        <Card className={cn("h-full flex flex-col overflow-hidden", className)}>
            <div className="flex justify-between px-3 pt-2">
                <span className="font-bold select-none">Friends</span>
                <Button className="w-[20px] h-[20px]" size="icon">
                    <ChevronLeft size={16} />
                </Button>
            </div>
            <Separator />
            {
                following?.map((follow: Prisma.FollowGetPayload<{ include: { following: true } }>) => {
                    const following = follow.following;
                    return (
                        <Button containerClass="w-full" className="w-full flex justify-between rounded-none" key={following.id}  variant="ghost">
                            <div className="flex items-center gap-2">
                                <UserAvatar avatar={following.avatarPath} userName={following.userName}/>
                                @{ following.userName }
                            </div>
                        </Button>
                    );
                })
            }
        </Card>
    )
}