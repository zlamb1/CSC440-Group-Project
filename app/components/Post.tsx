import UserAvatar from "@components/UserAvatar";
import {Button} from "@ui/button";
import React, { createRef, useState } from "react";
import {Edit, Edit2, EllipsisVerticalIcon, Trash, TrashIcon} from "lucide-react";
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@ui/dropdown-menu";
import {useFetcher} from "@remix-run/react";
import {LoadingSpinner} from "@components/LoadingSpinner";
import {useIsPresent} from "framer-motion";
import useOverflow from "@/utils/useOverflow";
import {PostEditor} from "@components/PostEditor";

function PostContextMenu({ post, user, onEdit }: { post: any, user: any, onEdit?: () => void }) {
    const fetcher = useFetcher();
    const isPresent = useIsPresent();
    const [ isOpen, setOpen ] = useState(false);
    const isTransitioning = fetcher.state !== 'idle' || !isPresent;
    if (post.posterId !== user.id) {
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
            <DropdownMenuTrigger className={post.posterId !== user.id ? 'hidden' : ''} asChild>
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

function Post({className, post, user}: { className?: string, post: any, user: any }) {
    const [ isEditing, setEditing ] = useState(false);
    return (
        <div className={"flex gap-3 " + className} key={post.id}>
            <div className="flex flex-col gap-2 w-full">
                <div className="flex justify-between items-center gap-3">
                    <div className="flex gap-3 select-none">
                        <UserAvatar userName={post.userName} />
                        <span className="font-bold">{post.userName}</span>
                    </div>
                    <PostContextMenu post={post} user={user} onEdit={ () => setEditing(true) } />
                </div>
                <div className="ml-10 flex flex-col gap-2">
                    {
                        isEditing ?
                            <div className="flex flex-col gap-2">
                                <PostEditor editorProps={{ attributes: { class: 'focus-visible:outline-none' }}} content={post.content} />
                                <Button containerClass="w-fit align-end" variant="edit">Edit</Button>
                            </div>
                            : <RawPost content={post.content} />
                    }
                </div>
            </div>
        </div>
    )
}

export default React.memo(Post);