import {useFetcher} from "@remix-run/react";
import {useIsPresent} from "framer-motion";
import React, {useState} from "react";
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@ui/dropdown-menu";
import {Button} from "@ui/button";
import {Edit2, EllipsisVerticalIcon, Hammer, Trash} from "lucide-react";
import {LoadingSpinner} from "@components/LoadingSpinner";
import {Post} from "@prisma/client";
import {UserWithLoggedIn} from "@/utils/types";

export default function ContextMenu({ post, user, onEdit }: { post: Post, user: UserWithLoggedIn, onEdit?: () => void }) {
    const fetcher = useFetcher();
    const isPresent = useIsPresent();
    const [ isOpen, setOpen ] = useState(false);
    const isTransitioning = fetcher.state !== 'idle' || !isPresent;
    if (post.userId !== user?.id) {
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
            <DropdownMenuTrigger className={post.userId !== user?.id ? 'hidden' : ''} asChild>
                <Button className="rounded-full w-[25px] h-[25px]" variant="ghost" size="icon">
                    <EllipsisVerticalIcon className="w-[20px] h-[20px]" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="flex flex-col">
                <Button containerClass="w-100 flex" className="flex-grow flex gap-4 text-primary hover:text-primary" variant="ghost" onClick={ onClickEdit }>
                    <Edit2 className="" size={20} />
                    <span className="flex-grow text-left">Edit</span>
                </Button>
                <Button containerClass="w-100 flex" className="flex-grow flex gap-4 text-yellow-500 hover:text-yellow-500" variant="ghost">
                    <Hammer size={20} />
                    <span className="flex-grow text-left">Moderate</span>
                </Button>
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