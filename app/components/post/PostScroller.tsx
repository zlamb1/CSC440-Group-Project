import {UserWithLoggedIn} from "@/utils/types";
import {AnimatePresence, motion} from "framer-motion";
import React from "react";
import Post from "@components/post/Post";
import InfiniteScroll from "@components/InfiniteScroll";
import useIsSSR from "@/utils/useIsSSR";
import {PostWithDate} from "@/utils/usePublicPostsStore";

export interface PostScrollerProps {
    posts: PostWithDate[],
    user: UserWithLoggedIn,
    onLoad: () => void,
    isLoading: boolean,
}

export default function PostScroller({ posts, user, onLoad, isLoading }: PostScrollerProps) {
    const isSSR = useIsSSR();

    function doLoad() {
        if (!isLoading) onLoad();
    }

    return (
        <InfiniteScroll load={doLoad} isLoading={isLoading}>
            <AnimatePresence initial={!isSSR}>
                {
                    posts.map(post =>
                        <div className="flex flex-col" key={post.id}>
                            <Post className="p-3 px-5" id={post.id} viewer={user} />
                            <hr />
                        </div>
                    )
                }
            </AnimatePresence>
        </InfiniteScroll>
    )
}