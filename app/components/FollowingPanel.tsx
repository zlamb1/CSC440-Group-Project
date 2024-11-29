import {Card} from "@ui/card";
import {Button} from "@ui/button";
import {ChevronDown, ChevronUp} from "lucide-react";
import {Separator} from "@ui/separator";
import UserAvatar from "@components/user/UserAvatar";
import React, {CSSProperties, useContext, useState} from "react";
import {FollowWithFollowing} from "@/utils/types";
import {cn} from "@/lib/utils";
import {Link} from "@remix-run/react";
import {UserContext} from "@/utils/context/UserContext";
import Expand from "@ui/expand";

export default function FollowingPanel({className, style}: { className?: string, style?: CSSProperties }) {
  const user = useContext(UserContext);

  if (!user?.loggedIn) {
    return <div className={className}/>;
  }

  const following = user?.following;

  const [showContent, setShowContent] = useState(true);

  const toggleContent = () => {
    setShowContent(!showContent);
  };

  return (
    <Card className={cn("h-full flex flex-col overflow-hidden", className)} style={style}>
      <Button containerClass="w-full" className="w-full flex justify-between px-3 py-2 items-center" variant="ghost"
              onClick={toggleContent} noClickAnimation>
        <span className="font-bold select-none">Following</span>
        {showContent ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
      </Button>
      <Separator/>
      <Expand show={showContent}>
        {
          following?.map((follow: FollowWithFollowing) => {
            const following = follow.following;
            return (
              <Button containerClass="w-full" className="w-full flex justify-between rounded-none" key={following.id}
                      variant="ghost">
                <Link to={`/users/${follow.following.userName}`} className="w-full flex items-center gap-2">
                  <UserAvatar avatar={following.avatarPath} userName={following.userName}/>
                  @{following.userName}
                </Link>
              </Button>
            );
          })
        }
      </Expand>
    </Card>
  )
}