import {useFetcher} from "@remix-run/react";
import {useIsPresent} from "framer-motion";
import React, {Fragment, useContext, useEffect, useState} from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@ui/dropdown-menu";
import {Button} from "@ui/button";
import {AlertTriangleIcon, Edit, EllipsisVerticalIcon, Hammer, Trash} from "lucide-react";
import {LoadingSpinner} from "@components/LoadingSpinner";
import {Post, UserRole} from "@prisma/client";
import {usePostStore} from "@/utils/posts/usePostStore";
import {useShallow} from "zustand/react/shallow";
import {emitter, PostEvent} from "@/utils/posts/usePostEvents";
import {UserContext} from "@/utils/context/UserContext";
import {cn} from "@/lib/utils";
import {useErrorToast, useSuccessToast, useUnknownErrorToast} from "@/utils/toast";
import ReportDialog from "@components/post/ReportDialog";

export default function ContextMenu({post, exitDuration, onEdit}: {
  post: Post,
  exitDuration: number,
  onEdit?: () => void
}) {
  const fetcher = useFetcher();
  const isPresent = useIsPresent();
  const user = useContext(UserContext)
  const [isOpen, setOpen] = useState(false);
  const {deletePost, deleteReply} = usePostStore(useShallow((state: any) => ({
    deletePost: state.delete,
    deleteReply: state.deleteReply
  })));

  const isTransitioning = fetcher.state !== 'idle' || !isPresent;
  const isOwnPost = post?.userId === user?.id;
  const isModerator = user?.role === UserRole.MODERATOR;

  useEffect(() => {
    if (fetcher?.data) {
      if (fetcher.data.success) {
        const replyTo = !!post?.replyTo;
        useSuccessToast(`Deleted ${replyTo ? 'Reply' : 'Story'}`);
        // notify post stores to trigger exit animation
        emitter.emit(PostEvent.DELETE, {post: post.id});
        if (post.replyTo) {
          deleteReply({id: post.id, replyTo: post.replyTo});
        }
        setTimeout(() => {
          // delete element from usePostStore following exit animation
          deletePost({post, deleteReply: false, emit: false});
        }, exitDuration * 1000 + 100);
      } else if (fetcher.data.error) {
        useErrorToast(fetcher.data.error);
      } else {
        useUnknownErrorToast();
      }
    }
    if (fetcher?.data?.success) {

    }
  }, [fetcher?.data]);

  function onClickEdit() {
    setOpen(false);
    onEdit?.();
  }

  function onClickDelete(evt: React.MouseEvent) {
    evt.preventDefault();
    fetcher.submit(null, {
      action: `/posts/delete/${post.id}`,
      method: 'POST',
    });
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={(isOpen) => setOpen(isOpen)} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button className="rounded-full w-[25px] h-[25px]" variant="ghost" size="icon">
          <EllipsisVerticalIcon className="w-[20px] h-[20px]"/>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onClickEdit} className={cn("gap-2 cursor-pointer", !isOwnPost && 'hidden')}>
            <Edit size={16}/>
            <span>Edit</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className={cn("text-yellow-600 focus:text-yellow-700 dark:text-yellow-300 dark:focus:text-yellow-400 gap-2 cursor-pointer", !isModerator && 'hidden')}>
            <Hammer size={16}/>
            Moderate
          </DropdownMenuItem>
          <DropdownMenuSeparator/>
          <ReportDialog>
            <DropdownMenuItem
              className={cn("text-red-400 focus:text-red-500 gap-2 cursor-pointer", isOwnPost && 'hidden')}
              onSelect={(e) => e.preventDefault()}
            >
              <AlertTriangleIcon size={16}/>
              Report
            </DropdownMenuItem>
          </ReportDialog>
          <DropdownMenuItem
            className={cn("justify-center gap-2 text-red-600 focus:text-red-700 cursor-pointer", !isOwnPost && 'hidden')}
            onClick={onClickDelete}
            disabled={isTransitioning}>
            {
              isTransitioning ? <LoadingSpinner/> :
                <Fragment>
                  <Trash size={16}/>
                  <span className="flex-grow text-left">Delete</span>
                </Fragment>
            }
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}