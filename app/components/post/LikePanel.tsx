import {PostWithUser, UserWithLoggedIn} from "@/utils/types";
import {useFetcher} from "@remix-run/react";
import {cn} from "@/lib/utils";
import {Button} from "@ui/button";
import {ThumbsDown, ThumbsUp} from "lucide-react";
import React, {useEffect, useRef, useState} from "react";
import {usePostStore} from "@/utils/posts/usePostStore";
import {useShallow} from "zustand/react/shallow";
import useMountedEffect from "@/utils/useMountedEffect";
import {LoadingSpinner} from "@components/LoadingSpinner";

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

export default function LikePanel({ className, post, viewer }: { className?: string, post: PostWithUser, viewer: UserWithLoggedIn }) {
    const fetcher = useFetcher();

    const isLiked = fetcher.formData ? getIsLiked(fetcher.formData.get('liked')) : post?.liked;
    const likeCount = fetcher.formData ? getLikeCount(post?.likeCount ?? 0, post?.liked, fetcher.formData.get('liked')) : (post?.likeCount ?? 0);

    const { like } = usePostStore(useShallow((state: any) => ({ like: state.like })));

    useMountedEffect(() => {
        if (fetcher?.data?.liked !== undefined) {
            like(post.id, fetcher.data.liked);
        }
    }, [fetcher.data]);

    return (
        <div className={cn("flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-900", className)}>
            <fetcher.Form method="POST"
                          action={`/posts/${post.id}/like`}
                          className="flex items-center">
                <Button className="w-[24px] h-[24px] rounded-full"
                        variant="ghost"
                        size="icon"
                        type="submit"
                        disabled={!viewer?.loggedIn || fetcher.state !== 'idle'}>
                    <input className="hidden" name="liked"
                           value={isLiked === true ? 'null' : 'true'}
                           readOnly
                    />
                    <ThumbsUp size={16}
                              className={"stroke-current " + (isLiked === true ? 'fill-primary' : '')}
                    />
                </Button>
            </fetcher.Form>
            <span className="select-none text-sm text-center font-medium min-w-[14px]">
                {fetcher.state === 'idle' ? `${likeCount}` : <LoadingSpinner size={14} />}
            </span>
            <fetcher.Form method="POST" action={`/posts/${post.id}/like`}>
                <Button className="w-[24px] h-[24px] rounded-full"
                        variant="ghost"
                        size="icon"
                        type="submit"
                        disabled={!viewer?.loggedIn || fetcher.state !== 'idle'}>
                    <input className="hidden" name="liked"
                           value={isLiked === false ? 'null' : 'false'}
                           readOnly
                    />
                    <ThumbsDown size={16}
                                className={"stroke-current " + (isLiked === false ? 'fill-primary' : '')}
                    />
                </Button>
            </fetcher.Form>
        </div>
    );
}