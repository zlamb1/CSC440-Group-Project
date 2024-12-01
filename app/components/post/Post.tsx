import UserAvatar from "@components/user/UserAvatar";
import {Button} from "@ui/button";
import React, {useContext, useEffect, useState} from "react";
import {MessageCircle, Pencil,} from "lucide-react";
import {Link} from "@remix-run/react";
import ContextMenu from "@components/post/ContextMenu";
import PostView from "@components/post/PostView";
import UserHoverCard from "@components/hover/UserHoverCard";
import LikePanel from "@components/post/LikePanel";
import ReplyEditor from "@components/post/ReplyEditor";
import {formatPastDate} from "@/utils/time";
import {usePostStore} from "@/utils/posts/usePostStore";
import {Card} from "@ui/card";
import {useShallow} from "zustand/react/shallow";
import {cn} from "@/lib/utils";
import {motion} from "framer-motion";
import {UserContext} from "@/utils/context/UserContext";
import GenreTags from "@components/post/GenreTags";
import {PostContext} from "@/utils/context/PostContext";
import Expand from "@ui/expand";

function Post({className, id, depth = 1, autoReply = true, exitDuration = 0.25}: {
  className?: string,
  id: string,
  depth?: number,
  autoReply?: boolean,
  exitDuration?: number,
}) {
  const viewer = useContext(UserContext);
  const [isEditing, setEditing] = useState<boolean>(false);
  const [isReplying, setIsReplying] = useState<boolean>(!!viewer?.loggedIn && autoReply);
  const [showReplies, setShowReplies] = useState<boolean>(depth > 0);
  const [formattedTime, setFormattedTime] = useState<string>('');

  const {post} = usePostStore(useShallow((state: any) => ({post: state[id]})));

  const hasReplies = post?.replies && post.replies.length;

  useEffect(() => {
    const date = new Date(post?.postedAt);
    const diff = new Date().getTime() - date.getTime();

    if ((post?.postedAt && !formattedTime) || diff < 1000 * 60) {
      const id = setInterval(() => setFormattedTime(formatPastDate(post?.postedAt)));
      return () => clearInterval(id);
    }
  });

  if (!post) {
    return (
      <Card className="my-3 p-3">
        <span>Post not found</span>
      </Card>
    )
  }

  function getReplyTree() {
    return post?.replies?.map((reply: string) => <Post key={reply} id={reply} depth={depth - 1} autoReply={false}/>)
  }

  return (
    <PostContext.Provider value={post}>
      <motion.div initial={{opacity: 0}}
                  animate={{opacity: 1, height: 'auto'}}
                  exit={{opacity: 0, height: 0}}
                  transition={{duration: exitDuration}}
                  className="flex overflow-y-hidden"
                  key={post.id}
      >
        <div className={cn("flex flex-col w-full", className)}>
          <div className="flex justify-between items-center gap-3 flex-grow-0 overflow-x-hidden">
            <div className="flex gap-1 items-center flex-grow-0 flex-wrap">
              <UserHoverCard user={post.user}>
                <Link to={`/users/${post.user?.userName}`} className="font-bold flex flex-row gap-3 flex-shrink-0">
                  <UserAvatar avatar={post.user?.avatarPath} userName={post.user?.userName}/>
                  <div className="flex items-center gap-1">
                    {post.user?.userName}
                    <span className="text-sm text-gray-400"
                          suppressHydrationWarning>• {formattedTime}</span>
                  </div>
                </Link>
              </UserHoverCard>
              <GenreTags genres={post.genres} editable={post?.userId === viewer?.id}/>
            </div>
            <div className="h-full">
              <ContextMenu post={post} exitDuration={exitDuration} onEdit={() => setEditing(true)}/>
            </div>
          </div>
          <div className="ml-10 mt-1 flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex flex-col">
                <PostView post={post} isEditing={isEditing}
                          onIsEditingChange={(_isEditing: boolean) => setEditing(_isEditing)}/>
              </div>
              <div className="flex gap-2">
                <LikePanel post={post}/>
                <div className="flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-900">
                  <Button containerClass="flex"
                          className="h-[25px] flex gap-1 items-center rounded-full"
                          size="icon"
                          variant={isReplying ? undefined : 'ghost'}
                          disabled={!viewer?.loggedIn}
                          onClick={() => setIsReplying(!isReplying)}>
                    <Pencil size={16}/>
                  </Button>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-900">
                  <Button containerClass="flex"
                          className="h-[25px] flex gap-1 items-center rounded-full"
                          size="icon"
                          variant={showReplies ? undefined : 'ghost'}
                          onClick={() => setShowReplies(prev => !prev)}>
                    <MessageCircle size={16}/>
                    <span className="text-bold">{post.replyCount}</span>
                  </Button>
                </div>
              </div>
            </div>
            {viewer?.loggedIn && <ReplyEditor post={post} isReplying={isReplying}/>}
            <Expand initial={false} show={showReplies && hasReplies}>
              {getReplyTree()}
            </Expand>
          </div>
        </div>
      </motion.div>
    </PostContext.Provider>
  );
}

export default React.memo(Post);