import {useEffect, useRef, useState} from "react";
import {Link, useFetcher} from "@remix-run/react";
import {User} from "@prisma/client";
import UserAvatar from "@components/user/UserAvatar";
import UserHoverCard from "@components/hover/UserHoverCard";
import {LoadingSpinner} from "@components/LoadingSpinner";
import {Button} from "@ui/button";

export default function RequestCell({row}: { row: any }) {
  const hasFetched = useRef<boolean>(false);
  const fetcher = useFetcher();
  const followFetcher = useFetcher();
  const [user, setUser] = useState<User | null>(null);

  const data = JSON.parse(row?.data);

  useEffect(() => {
    if (data) {
      fetcher.submit(null, {
        action: `/users/id/${data.requestorId}/public`,
        method: 'GET',
      });
    }
  }, []);

  useEffect(() => {
    hasFetched.current = true;
    setUser(fetcher?.data?.user);
  }, [fetcher?.data]);

  if (fetcher.state !== 'idle' || !hasFetched.current) {
    return <LoadingSpinner size={16}/>;
  }

  if (!user) {
    return null;
  }

  const name = user.displayName || user.userName;

  return (
    <div className="flex justify-between">
      <div className="flex items-center gap-1">
        <UserHoverCard user={user}>
          <Link to={`/users/${user.userName}`} className="flex gap-1 items-center">
            <UserAvatar size={20} avatar={user.avatarPath} userName={user.userName}/> {name}
          </Link>
        </UserHoverCard>
        has requested to follow you.
      </div>
      <div className="flex gap-1">
        <followFetcher.Form action={`/users/${user.id}/follow`} method="POST">
          <input className="hidden" value="true" name="follow" readOnly/>
          <Button className="w-16 h-8" type="submit" disabled={followFetcher.state !== 'idle'}>
            {followFetcher.state === 'idle' ? "Accept" : <LoadingSpinner/>}
          </Button>
        </followFetcher.Form>
        <followFetcher.Form action={`/users/${user.id}/follow`} method="POST">
          <input className="hidden" value="false" name="follow" readOnly/>
          <Button className="w-16 h-8" variant="ghost" disabled={followFetcher.state !== 'idle'}>
            {followFetcher.state === 'idle' ? "Reject" : <LoadingSpinner/>}
          </Button>
        </followFetcher.Form>
      </div>
    </div>
  );
}