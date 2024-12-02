import {Button} from "@ui/button";
import {LoadingSpinner} from "@components/LoadingSpinner";
import {useFetcher} from "@remix-run/react";
import {User} from "@prisma/client";
import {MouseEvent, useContext} from "react";
import {UserContext} from "@/utils/context/UserContext";

export default function FollowButton({user, onClick}: {
  user: User,
  onClick?: (evt: MouseEvent<HTMLButtonElement>) => void
}) {
  const viewer = useContext(UserContext);
  const fetcher = useFetcher();

  const isFollowing = viewer?.following?.some(follow => follow.followingId === user?.id) || false;
  const isRequested = !!viewer?.sentRequests?.find(request => request.requestedId === user.id);

  function onFollow(evt: MouseEvent<HTMLButtonElement>) {
    const formData = new FormData();
    formData.set('follow', !isFollowing + '');

    fetcher.submit(formData, {
      action: `/users/${user.id}/follow`,
      method: 'POST',
    });
    onClick?.(evt);
  }

  return (
    <Button className="min-w-[90px] font-bold" onClick={onFollow} disabled={isRequested}>
      {
        isRequested ? 'Requested' :
          (fetcher.state === 'idle' ? (isFollowing ? 'Unfollow' : 'Follow') : <LoadingSpinner/>)
      }
    </Button>
  );
}