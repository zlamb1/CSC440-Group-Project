import UserAvatar from "@components/user/UserAvatar";
import {Button} from "@ui/button";
import React, {FormEvent, useRef, useState} from "react";
import {
    MessageCircle,
    Pencil,
    ThumbsDown,
    ThumbsUp
} from "lucide-react";
import {Link, useFetcher} from "@remix-run/react";
import ContextMenu from "@components/post/ContextMenu";
import PostView from "@components/post/PostView";
import {PostEditor, PostEditorElement} from "@components/post/PostEditor";
import {LoadingSpinner} from "@components/LoadingSpinner";
import {AnimatePresence, motion} from "framer-motion";
import ReplyView from "@components/post/ReplyView";
import {PostWithUser, UserWithLoggedIn} from "@/utils/types";
import UserHoverCard from "@components/hover/UserHoverCard";

function getIsLiked(state: any) {
    if (state == null || state == 'null') {
        return null;
    }
    return state === true || state === 'true';
}

function getLikeCount(likeCount: number, oldState?: any, state?: any) {
    const oldIsLiked = getIsLiked(oldState);
    const newIsLiked = getIsLiked(state);
    if (oldIsLiked !== newIsLiked) {
        if (oldIsLiked === null) {
            return likeCount + (newIsLiked ? 1 : -1);
        } else if (newIsLiked === null) {
            return likeCount + (oldIsLiked ? -1 : 1);
        } else {
            return likeCount + (newIsLiked ? 2 : -2);
        }
    }
    return likeCount;
}

function Post({className, post, viewer, depth = 1}: { className?: string, post: PostWithUser, viewer: UserWithLoggedIn, depth?: number }) {
    const [ isEditing, setEditing ] = useState<boolean>(false);
    const [ showReplies, setShowReplies ] = useState<boolean>(depth > 0);
    const [ isReplyEditorActive, setReplyEditorActive ] = useState<boolean>(false);
    const [ isReplying, setIsReplying ] = useState<boolean>(viewer.loggedIn);
    const replyEditorRef = useRef<PostEditorElement>();
    const likeFetcher = useFetcher();
    const replyFetcher = useFetcher();

    const isLiked = likeFetcher.formData ? getIsLiked(likeFetcher.formData.get('liked')) : post?.postLike?.liked;
    const likeCount = likeFetcher.formData ? getLikeCount(post.likeCount ?? 0, post?.postLike?.liked, likeFetcher.formData.get('liked')) : post.likeCount;

    const onReply = (evt: FormEvent<HTMLFormElement>) => {
        evt.preventDefault();
        if (replyEditorRef.current) {
            const formData = new FormData();
            formData.set('content', replyEditorRef.current.getContent());
            replyFetcher.submit(formData, {
                method: 'POST',
                action: `/posts/${post.id}/reply`,
            });
        }
    }

    function handleCancel(evt: React.MouseEvent) {
        evt.stopPropagation();
        setReplyEditorActive(false);
    }

    return (
        <div className={"flex gap-3 " + className} key={post.id}>
            <div className="flex flex-col w-full">
                <div className="flex justify-between items-center gap-3">
                    <div className="flex gap-3 select-none">
                        <UserHoverCard viewer={viewer} user={post.user}>
                            <Link to={`/users/${post.user?.userName}`} className="font-bold flex flex-row gap-3">
                                <UserAvatar avatar={post.user?.avatarPath} userName={post.user?.userName} />
                                {post.user?.userName}
                            </Link>
                        </UserHoverCard>
                    </div>
                    <ContextMenu post={post} user={viewer} onEdit={ () => setEditing(true) } />
                </div>
                <div className="ml-10 flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                        <div className="flex flex-col">
                            <PostView post={post} isEditing={isEditing}
                                      onIsEditingChange={(_isEditing: boolean) => setEditing(_isEditing)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-900">
                                <likeFetcher.Form method="POST" action={`/posts/${post.id}/like`}
                                                  className="flex items-center">
                                    <Button className="w-[24px] h-[24px] rounded-full"
                                            variant="ghost"
                                            size="icon"
                                            type="submit"
                                            disabled={!viewer.loggedIn}>
                                        <input className="hidden" name="liked"
                                               value={isLiked === true ? 'null' : 'true'}
                                               readOnly/>
                                        <ThumbsUp size={16}
                                                  className={"stroke-current " + (isLiked === true ? 'fill-primary' : '')}/>
                                    </Button>
                                </likeFetcher.Form>
                                <span className="select-none text-sm font-medium">{likeCount}</span>
                                <likeFetcher.Form method="POST" action={`/posts/${post.id}/like`}>
                                    <Button className="w-[24px] h-[24px] rounded-full"
                                            variant="ghost"
                                            size="icon"
                                            type="submit"
                                            disabled={!viewer.loggedIn}>
                                        <input className="hidden" name="liked"
                                               value={isLiked === false ? 'null' : 'false'}
                                               readOnly/>
                                        <ThumbsDown size={16}
                                                    className={"stroke-current " + (isLiked === false ? 'fill-primary' : '')}/>
                                    </Button>
                                </likeFetcher.Form>
                            </div>
                            <div className="flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-900">
                                <Button containerClass="flex"
                                        className="h-[25px] flex gap-1 items-center rounded-full"
                                        size="icon"
                                        variant={isReplying ? undefined : 'ghost'}
                                        disabled={!viewer.loggedIn}
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
                    <AnimatePresence mode="wait" initial={false}>
                        {
                            isReplying ?
                                <replyFetcher.Form onSubmit={onReply}>
                                        <PostEditor placeholder="Write a reply..."
                                                    ref={replyEditorRef}
                                                    isActive={isReplyEditorActive}
                                                    focus={setReplyEditorActive}
                                                    editable={replyFetcher.state === 'idle'}
                                                    editorProps={{attributes: {class: 'focus-visible:outline-none'}}}
                                                    append={
                                                        <motion.div initial={{opacity: 0, height: 0}}
                                                                    animate={{opacity: 1, height: 'auto'}}
                                                                    exit={{opacity: 0, height: 0}}
                                                                    className="flex gap-2 justify-end overflow-y-hidden">
                                                            <Button variant="ghost" onClick={handleCancel} type="button">
                                                                Cancel
                                                            </Button>
                                                            <Button type="submit"
                                                                    disabled={replyFetcher.state !== 'idle'}>
                                                                {
                                                                    replyFetcher.state === 'idle' ?
                                                                        'Reply' : <LoadingSpinner/>
                                                                }
                                                            </Button>
                                                        </motion.div>
                                                    }
                                        />
                                </replyFetcher.Form>
                                : null
                        }
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

export default React.memo(Post);