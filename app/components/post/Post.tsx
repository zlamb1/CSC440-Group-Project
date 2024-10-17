import UserAvatar from "@components/UserAvatar";
import {Button} from "@ui/button";
import React, {FormEvent, useEffect, useRef, useState} from "react";
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
import {Skeleton} from "@ui/skeleton";

export interface ReplyListProps {
    post: any;
    user: any;
    showReplies?: boolean;
    onLoad?: (replies: any) => void;
}

function ReplyList({ post, user, showReplies = true, onLoad = () => {} }: ReplyListProps) {
    const [ replies, setReplies ] = useState<any[]>([]);
    const fetcher = useFetcher();
    useEffect(() => {
        if (fetcher.state === 'idle') {
            setReplies(fetcher.data);
            onLoad(replies);
        }
    }, [fetcher]);
    useEffect(() => {
        getReplies();
    }, [showReplies]);
    const getReplies = () => {
        if (showReplies) {
            fetcher.submit(null, {
                action: `/posts/${post.id}/replies`,
            });
        }
    }
    function renderSkeletons() {
        const skeletons = [];
        for (let i = 0; i < post?.replyCount - (replies?.length ?? 0); i++) {
            skeletons.push(
                <Skeleton key={i} className="w-full h-[65px]" />
            )
        }
        return skeletons;
    }
    return (
        <AnimatePresence initial={false}>
            {
                showReplies ?
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.3 }} className="flex flex-col gap-2 overflow-hidden">
                        {
                            replies?.map((reply: any) =>
                                <Post key={reply.id} post={reply} user={user} />
                            )
                        }
                        {
                            fetcher.state !== 'idle' ? renderSkeletons() : null
                        }
                    </motion.div> : null
            }
            {
                fetcher.state !== 'idle' ? null : null
            }
        </AnimatePresence>
    );
}

function getIsLiked(state: any) {
    if (state == null || state == 'null') {
        return null;
    }
    return state === true || state === 'true';
}

function getLikeCount(likeCount: number, oldState: any, state: any) {
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

function Post({className, post, user}: { className?: string, post: any, user: any }) {
    const [ isEditing, setEditing ] = useState<boolean>(false);
    const [ showReplies, setShowReplies ] = useState<boolean>(false);
    const [ isReplying, setIsReplying ] = useState<boolean>(false);
    const replyEditorRef = useRef<PostEditorElement>();
    const likeFetcher = useFetcher();
    const replyFetcher = useFetcher();

    const isLiked = likeFetcher.formData ? getIsLiked(likeFetcher.formData.get('liked')) : post.liked;
    const likeCount = likeFetcher.formData ? getLikeCount(post.likeCount, post.liked, likeFetcher.formData.get('liked')) : post.likeCount;

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
                        <UserAvatar avatar={post.avatarPath} userName={post.userName} />
                        <span className="font-bold">{post.userName}</span>
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
                    <ReplyList post={post}
                               user={user}
                               showReplies={showReplies}
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