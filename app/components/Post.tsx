import UserAvatar from "@components/UserAvatar";
import {PostView} from "@components/PostEditor";
import {Button} from "@ui/button";
import React from "react";
import {EllipsisVerticalIcon, TrashIcon} from "lucide-react";
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@ui/dropdown-menu";
import {useFetcher} from "@remix-run/react";
import {LoadingSpinner} from "@components/LoadingSpinner";

export default function Post({ className, post, user }: { className?: string, post: any, user: any }) {
    const fetcher = useFetcher();
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
                                        <Button containerClass="w-100 flex" className="flex-grow text-red-600 hover:text-red-500" variant="ghost">
                                            {
                                                fetcher.state !== 'idle' ? <LoadingSpinner /> :
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
                <div className="ml-10">
                    <PostView editorProps={{ attributes: { class: 'break-all' } }} content={post.content}/>
                </div>
            </div>
        </div>
    )
}