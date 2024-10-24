import UserAvatar from "@components/UserAvatar";
import {Button} from "@ui/button";
import React, {FormEvent, useRef, useState} from "react";
import {
    MessageCircle, NotebookPen,
    ThumbsDown,
    ThumbsUp
} from "lucide-react";
import {useFetcher} from "@remix-run/react";
import ContextMenu from "@components/post/ContextMenu";
import PostView from "@components/post/PostView";
import {PostEditor, PostEditorElement} from "@components/post/PostEditor";
import {LoadingSpinner} from "@components/LoadingSpinner";
import {AnimatePresence, motion} from "framer-motion";
import ReplyView from "@components/post/ReplyView";
import {PostWithUser, UserWithLoggedIn} from "@/utils/types";

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

function Post({className, post, user, depth = 1}: { className?: string, post: PostWithUser, user: UserWithLoggedIn, depth?: number }) {
    const [ isEditing, setEditing ] = useState<boolean>(false);
    const [ showReplies, setShowReplies ] = useState<boolean>(depth > 0);
    const [ isReplying, setIsReplying ] = useState<boolean>(false);
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

    return (
        <div className={"flex gap-3 " + className} key={post.id}>
            <div className="flex flex-col w-full">
                <div className="flex justify-between items-center gap-3">
                    <div className="flex gap-3 select-none">
                        <UserAvatar avatar={post.user?.avatarPath} userName={post.user?.userName} />
                        <span className="font-bold">{post.user?.userName}</span>
                    </div>
                    <ContextMenu post={post} user={user} onEdit={ () => setEditing(true) } />
                </div>
                <div className="ml-10 flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                        <div className="flex flex-col">
                            <PostView post={post} isEditing={isEditing}
                                      onIsEditingChange={(_isEditing: boolean) => setEditing(_isEditing)}/>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-900">
                                <likeFetcher.Form method="POST" action={`/posts/${post.id}/like`}
                                                  className="flex items-center">
                                    <Button className="w-[24px] h-[24px] rounded-full"
                                            variant="ghost"
                                            size="icon"
                                            type="submit"
                                            disabled={!user?.loggedIn}>
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
                                            disabled={!user?.loggedIn}>
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
                                        disabled={!user?.loggedIn}
                                        onClick={() => setIsReplying(!isReplying)}>
                                    <NotebookPen size={16}/>
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
                               user={user}
                               showReplies={showReplies}
                               depth={depth}
                    />
                    <AnimatePresence mode="wait" initial={false}>
                        {
                            isReplying ?
                                <replyFetcher.Form onSubmit={onReply}>
                                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}
                                                className="flex flex-col gap-3">
                                        <PostEditor placeholder="Write a reply..."
                                                    ref={replyEditorRef}
                                                    editable={replyFetcher.state === 'idle'}
                                                    editorProps={{attributes: {class: 'focus-visible:outline-none'}}}
                                        />
                                        <div className="flex justify-end">
                                            <Button type="submit" disabled={replyFetcher.state !== 'idle'}>
                                                {
                                                    replyFetcher.state === 'idle' ?
                                                        'Reply' : <LoadingSpinner/>
                                                }
                                            </Button>
                                        </div>
                                    </motion.div>
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