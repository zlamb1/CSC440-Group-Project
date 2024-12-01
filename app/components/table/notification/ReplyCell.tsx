import {Link, useFetcher} from "@remix-run/react";
import {ReactNode, useEffect, useRef, useState} from "react";
import {User} from "@prisma/client";
import {LoadingSpinner} from "@components/LoadingSpinner";
import UserAvatar from "@components/user/UserAvatar";
import UserHoverCard from "@components/hover/UserHoverCard";
import {AnimatePresence, motion} from "framer-motion";

export default function ReplyCell({row}: { row: any }) {
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

  function getWrapper(child: ReactNode) {
    return (
      <motion.div layout>
        {child}
      </motion.div>
    )
  }

  function getContent() {
    if (fetcher.state !== 'idle' || !hasFetched.current) {
      return <LoadingSpinner size={16}/>;
    }

    if (user) {
      const name = user.displayName || user.userName;
      row.content = `${name} replied to your post!`;
      return (
        <div className="flex gap-1">
          <UserHoverCard user={user}>
            <Link to={`/users/${user.userName}`} className="flex gap-1 items-center">
              <UserAvatar size={20} avatar={user.avatarPath} userName={user.userName}/> {name}
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

  return (
    <AnimatePresence>
      {getWrapper(getContent())}
    </AnimatePresence>
  )
}