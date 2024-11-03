import {Card} from "@ui/card";
import {Button} from "@ui/button";
import {ChevronUp, ChevronDown} from "lucide-react";
import {Separator} from "@ui/separator";
import UserAvatar from "@components/user/UserAvatar";
import React, {useState} from "react";
import {FollowWithFollowing, UserWithLoggedIn} from "@/utils/types";
import {cn} from "@/lib/utils";

export default function FollowingPanel({ className, user }: { className?: string, user: UserWithLoggedIn, }) {
    if (!user?.loggedIn) {
        return <div className={className} />;
    }

    const following = user?.following;

    const [showContent, setShowContent] = useState(true);

    const toggleContent = () => {
        setShowContent(!showContent);
    };

    return (
        <Card className={cn("h-full flex flex-col overflow-hidden", className)}>
            <div className="flex justify-between px-3 py-2 items-center">
                <span className="font-bold select-none">Following</span>
                <Button className="w-[20px] h-[20px]" size="icon" variant="ghost" onClick={ toggleContent }>
                    { showContent ? (
                        <ChevronUp size={16} />
                    ) : (
                        <ChevronDown size={16} />
                    )}
                  
                </Button>
            </div>
            <Separator />
            {
                showContent && following?.map((follow: FollowWithFollowing) => {
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