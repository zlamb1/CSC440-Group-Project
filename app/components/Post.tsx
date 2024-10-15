import UserAvatar from "@components/UserAvatar";
import {Button} from "@ui/button";
import React, { createRef, useState } from "react";
import {Edit2, EllipsisVerticalIcon, MessageSquare, ThumbsDown, ThumbsUp, Trash} from "lucide-react";
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@ui/dropdown-menu";
import {Form, useFetcher} from "@remix-run/react";
import {LoadingSpinner} from "@components/LoadingSpinner";
import {useIsPresent} from "framer-motion";
import useOverflow from "@/utils/useOverflow";
import {PostEditor} from "@components/PostEditor";

function PostContextMenu({ post, user, onEdit }: { post: any, user: any, onEdit?: () => void }) {
    const fetcher = useFetcher();
    const isPresent = useIsPresent();
    const [ isOpen, setOpen ] = useState(false);
    const isTransitioning = fetcher.state !== 'idle' || !isPresent;
    if (post.posterId !== user?.id) {
        return null;
    }
    function onClickEdit() {
        setOpen(false);
        if (onEdit) {
            onEdit();
        }
    }
    return (
        <DropdownMenu open={isOpen} onOpenChange={(isOpen) => setOpen(isOpen)}  modal={false}>
            <DropdownMenuTrigger className={post.posterId !== user?.id ? 'hidden' : ''} asChild>
                <Button className="rounded-full w-[25px] h-[25px]" variant="ghost" size="icon">
                    <EllipsisVerticalIcon className="w-[20px] h-[20px]" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="flex flex-col">
                <div>
                    <Button containerClass="w-100 flex" className="flex-grow flex gap-4" variant="ghost" onClick={ onClickEdit }>
                        <Edit2 className="text-blue-500" size={20} />
                        <span className="flex-grow text-left text-blue-400">Edit</span>
                    </Button>
                </div>
                <fetcher.Form action={`/posts/delete/${post.id}`} method="POST">
                    <Button containerClass="w-100 flex" className="flex-grow flex gap-4 text-red-600 hover:text-red-500"
                            variant="ghost" disabled={isTransitioning}>
                        {
                            isTransitioning ? <LoadingSpinner/> :
                                <>
                                    <Trash size={20} />
                                    <span className="flex-grow text-left">Delete</span>
                                </>
                        }
                    </Button>
                </fetcher.Form>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function RawPost({ content }: { content: string }) {
    const [ isExpanded, setExpanded ] = useState(false);
    const ref = createRef<HTMLDivElement>();
    const isOverflowing = useOverflow(ref, true, () => {});
    return (
        <>
            <div className={`break-all max-h-[200px] ${isExpanded ? 'overflow-y-scroll' : 'overflow-y-hidden'}`} dangerouslySetInnerHTML={{__html: content}} ref={ref} />
            {
                isOverflowing || isExpanded ? (
                    <Button containerClass="self-center" onClick={ () => setExpanded(!isExpanded) } variant="ghost">
                        {isExpanded ? 'Show less...' : 'Show more...'}
                    </Button>
                ) : null
            }
        </>
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
    const [ isEditing, setEditing ] = useState(false);
    const fetcher = useFetcher();
    const isLiked = fetcher.formData ? getIsLiked(fetcher.formData.get('liked')) : post.liked;
    const likeCount = fetcher.formData ? getLikeCount(post.likeCount, post.liked, fetcher.formData.get('liked')) : post.likeCount;
    return (
        <div className={"flex gap-3 " + className} key={post.id}>
            <div className="flex flex-col gap-2 w-full">
                <div className="flex justify-between items-center gap-3">
                    <div className="flex gap-3 select-none">
                        <UserAvatar avatar={post.avatarPath} userName={post.userName} />
                        <span className="font-bold">{post.userName}</span>
                    </div>
                    <PostContextMenu post={post} user={user} onEdit={ () => setEditing(true) } />
                </div>
                <div className="ml-10 flex flex-col gap-5">
                    {
                        isEditing ?
                            <div className="flex flex-col gap-2">
                                <PostEditor editorProps={{ attributes: { class: 'focus-visible:outline-none' }}} content={post.content} />
                                <Button containerClass="w-fit align-end" variant="edit">Edit</Button>
                            </div>
                            : <RawPost content={post.content} />
                    }
                    <div className="flex gap-2">
                        <div className="flex items-center gap-1 p-1 rounded-full bg-gray-100 dark:bg-gray-900">
                            <fetcher.Form method="POST" action={`/posts/${post.id}/like`} className="flex items-center">
                                <Button className="w-[24px] h-[24px] rounded-full"
                                        variant="ghost"
                                        size="icon"
                                        type="submit"
                                        disabled={!user?.loggedIn}>
                                    <input className="hidden" name="liked" value={ isLiked === true ? 'null' : 'true' } readOnly />
                                    <ThumbsUp size={16} className={"stroke-primary " + (isLiked === true ? 'fill-primary' : '')} />
                                </Button>
                            </fetcher.Form>
                            <span className="select-none text-sm font-medium">{likeCount}</span>
                            <fetcher.Form method="POST" action={`/posts/${post.id}/like`}>
                                <Button className="w-[24px] h-[24px] rounded-full"
                                        variant="ghost"
                                        size="icon"
                                        type="submit"
                                        disabled={!user?.loggedIn}>
                                    <input className="hidden" name="liked" value={ isLiked === false ? 'null' : 'false' } readOnly />
                                    <ThumbsDown size={16} className={"stroke-primary " + (isLiked === false ? 'fill-primary' : '')} />
                                </Button>
                            </fetcher.Form>
                        </div>
                        <div className="flex items-center gap-1 p-1 rounded-full bg-gray-100 dark:bg-gray-900">
                            <Button className="h-[25px] flex gap-1 items-center rounded-full" size="icon" variant="ghost">
                                <MessageSquare size={16} />
                                <span className="text-bold">{ post.replyCount }</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default React.memo(Post);