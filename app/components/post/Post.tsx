import UserAvatar from "@components/user/UserAvatar";
import {Button} from "@ui/button";
import React, {useEffect, useState} from "react";
import {
    MessageCircle,
    Pencil,
} from "lucide-react";
import {Link} from "@remix-run/react";
import ContextMenu from "@components/post/ContextMenu";
import PostView from "@components/post/PostView";
import ReplyView from "@components/post/ReplyView";
import {PostWithUser, UserWithLoggedIn} from "@/utils/types";
import UserHoverCard from "@components/hover/UserHoverCard";
import LikePanel from "@components/post/LikePanel";
import ReplyEditor from "@components/post/ReplyEditor";
import {formatPastDate} from "@/utils/time";

function Post({className, post, viewer, depth = 1, autoReply = true}: {
    className?: string,
    post: PostWithUser,
    viewer: UserWithLoggedIn,
    depth?: number,
    autoReply?: boolean
}) {
    const [isEditing, setEditing] = useState<boolean>(false);
    const [isReplying, setIsReplying] = useState<boolean>(viewer?.loggedIn && autoReply);
    const [showReplies, setShowReplies] = useState<boolean>(depth > 0);
    const [formattedTime, setFormattedTime] = useState<string>('');

    useEffect(() => {
        const date = new Date(post?.postedAt);
        const diff = new Date().getTime() - date.getTime();

        if ((post?.postedAt && !formattedTime) || diff < 1000 * 60) {
            const id = setInterval(() => setFormattedTime(formatPastDate(post?.postedAt)));
            return () => clearInterval(id);
        }
    });

    return (
        <div className={"flex gap-3 " + className} key={post.id}>
            <div className="flex flex-col w-full">
                <div className="flex justify-between items-center gap-3">
                    <div className="flex gap-3 select-none">
                        <UserHoverCard viewer={viewer} user={post.user}>
                            <Link to={`/users/${post.user?.userName}`} className="font-bold flex flex-row gap-3">
                                <UserAvatar avatar={post.user?.avatarPath} userName={post.user?.userName}/>
                                <div className="flex items-center gap-1">
                                    {post.user?.userName}
                                    <span className="text-sm text-gray-400">• {formattedTime}</span>
                                </div>
                            </Link>
                        </UserHoverCard>
                    </div>
                    <ContextMenu post={post} user={viewer} onEdit={() => setEditing(true) } />
                </div>
                <div className="ml-10 flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                        <div className="flex flex-col">
                            <PostView post={post} isEditing={isEditing}
                                      onIsEditingChange={(_isEditing: boolean) => setEditing(_isEditing)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <LikePanel post={post} viewer={viewer} />
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
                                        variant="ghost"
                                        onClick={() => setShowReplies(!showReplies)}>
                                    <MessageCircle size={16}/>
                                    <span className="text-bold">{post.replyCount}</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                    <ReplyView post={post}
                               user={viewer}
                               showReplies={showReplies}
                               depth={depth}
                    />
                    <ReplyEditor post={post} isReplying={isReplying} />
                </div>
            </div>
        </div>
    );
}

export default React.memo(Post);