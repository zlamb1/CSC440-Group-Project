import {Button} from "@ui/button";
import {LoadingSpinner} from "@components/LoadingSpinner";
import {useFetcher} from "@remix-run/react";
import {User} from "@prisma/client";
import {MouseEvent} from "react";

export default function FollowButton({user, isFollowing, onClick}: {
  user: User,
  isFollowing: boolean,
  onClick?: (evt: MouseEvent<HTMLButtonElement>) => void
}) {
  const fetcher = useFetcher();

  function onFollow(evt: MouseEvent<HTMLButtonElement>) {
    // TODO: follow
    if (onClick) {
      onClick(evt);
    }
  }

  return (
    <fetcher.Form method="POST" action={`/users/${user.id}/follow`}>
      <input className="hidden" value={!isFollowing + ''} name="follow" readOnly/>
      <Button className="min-w-[90px] font-bold" onClick={onFollow}>
        {
          fetcher.state === 'idle' ?
            isFollowing ? 'Unfollow' : 'Follow' :
            <LoadingSpinner/>
        }
      </Button>
    </fetcher.Form>
  );
}