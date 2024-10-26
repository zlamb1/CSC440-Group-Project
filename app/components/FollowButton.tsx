import {Button} from "@ui/button";
import {LoadingSpinner} from "@components/LoadingSpinner";
import {useFetcher} from "@remix-run/react";
import {User} from "@prisma/client";

export default function FollowButton({ user, isFollowing }: { user: User, isFollowing: boolean }) {
    const fetcher = useFetcher();

    return (
        <fetcher.Form method="POST" action={`/users/${user.id}/follow`}>
            <input className="hidden" value={!isFollowing + ''} name="follow" readOnly/>
            <Button className="min-w-[90px]" variant="outline">
                {
                    fetcher.state === 'idle' ?
                        isFollowing ? 'Unfollow' : 'Follow' :
                        <LoadingSpinner/>
                }
            </Button>
        </fetcher.Form>
    );
}