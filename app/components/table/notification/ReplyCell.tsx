import {Link, useFetcher} from "@remix-run/react";
import {useEffect, useRef, useState} from "react";
import {User} from "@prisma/client";
import {LoadingSpinner} from "@components/LoadingSpinner";
import UserAvatar from "@components/user/UserAvatar";
import UserHoverCard from "@components/hover/UserHoverCard";
import {UserWithLoggedIn} from "@/utils/types";
import {Button} from "@ui/button";

export default function ReplyCell({ row, viewer }: { row: any, viewer?: UserWithLoggedIn }) {
    const hasFetched = useRef<boolean>(false);
    const fetcher = useFetcher();
    const [user, setUser] = useState<User | null>(null);

    const data = JSON.parse(row?.data);

    useEffect(() => {
        if (data) {
            fetcher.submit(null, {
                action: `/users/${data.replierName}/public`,
                method: 'GET',
            });
        }
    }, []);

    useEffect(() => {
        hasFetched.current = true;
        setUser(fetcher?.data?.user);
    }, [fetcher?.data]);

    if (fetcher.state !== 'idle' || !hasFetched.current) {
        return <LoadingSpinner size={16} />;
    }

    if (user) {
        const name = user.displayName || user.userName;
        row.content = `${name} replied to your post!`;
        return (
            <div className="flex gap-1">
                <UserHoverCard viewer={viewer} user={user}>
                    <Link to={`/users/${user.userName}`} className="flex gap-1 items-center">
                        <UserAvatar size={20} avatar={user.avatarPath} userName={user.userName} /> {name}
                    </Link>
                </UserHoverCard>
                <Link className="underline text-primary hover:text-primary/75" to={`/posts/${data.replyId}`}>replied</Link>
                <span>to your</span>
                <Link className="underline text-primary hover:text-primary/75" to={`/posts/${data.replyTo}`}>post!</Link>
            </div>
        );
    }

    row.content = 'Somebody responded to your post!';
    return <span>Somebody responded to your post!</span>
}