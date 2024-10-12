import UserAvatar from "@components/UserAvatar";
import {Button} from "@ui/button";
import React, { createRef, useEffect, useState } from "react";
import {EllipsisVerticalIcon, TrashIcon} from "lucide-react";
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@ui/dropdown-menu";
import {useFetcher} from "@remix-run/react";
import {LoadingSpinner} from "@components/LoadingSpinner";
import {useIsPresent} from "framer-motion";
import useOverflow from "@/utils/useOverflow";

function Post({ className, post, user }: { className?: string, post: any, user: any }) {
    const fetcher = useFetcher();
    const isPresent = useIsPresent();
    const [ isExpanded, setExpanded ] = useState(false); 
    const ref = createRef<HTMLDivElement>();
    const isOverflowing = useOverflow(ref, true, () => {}); 
    const isTransitioning = fetcher.state !== 'idle' || !isPresent;
    return (
        <div className={"flex gap-3 " + className} key={post.id}>
            <div className="flex flex-col gap-2 w-full">
                <div className="flex justify-between items-center gap-3">
                    <div className="flex gap-3 select-none">
                        <UserAvatar userName={post.userName} />
                        <span className="font-bold">{post.userName}</span>
                    </div>
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger className={post.poster !== user.id ? 'hidden' : ''} asChild>
                            <Button className="rounded-full" variant="ghost" size="icon">
                                <EllipsisVerticalIcon className="w-[20px] h-[20px]" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="p-0 flex flex-col">
                            {
                                post.poster === user.id ?
                                    (<fetcher.Form action="/delete-post" method="post">
                                        <input name="id" className="hidden" readOnly value={post.id}/>
                                        <Button containerClass="w-100 flex" className="flex-grow text-red-600 hover:text-red-500" variant="ghost" disabled={isTransitioning}>
                                            {
                                                isTransitioning ? <LoadingSpinner /> :
                                                <>
                                                    <TrashIcon className="w-[20px] h-[20px] mr-1" />
                                                    <span>Delete</span>
                                                </>
                                            }
                                        </Button>
                                    </fetcher.Form>) : null
                            }
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="ml-10 flex flex-col gap-2">
                    <div className={`break-all max-h-[200px] ${isExpanded ? 'overflow-y-scroll' : 'overflow-y-hidden'}`} dangerouslySetInnerHTML={{__html: post.content}} ref={ref} />
                    {
                        isOverflowing || isExpanded ? (
                            <Button containerClass="self-center" onClick={ () => setExpanded(!isExpanded) } variant="ghost">
                                {isExpanded ? 'Show less...' : 'Show more...'}
                            </Button>
                        ) : null
                    }
                </div>
            </div>
        </div>
    )
}

export default React.memo(Post);