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
                            <motion.div initial={{opacity: 0.25, transform: 'translateX(-10px)'}}
                                        animate={{opacity: 1, height: 'auto', transform: 'translateX(0px)' }}
                                        exit={{ opacity: 0.25, height: 0, transform: 'translateX(10px)' }}
                                        transition={{ duration: 0.2 }}>
                                <Post className="p-3 px-5" id={post.id} viewer={user} />
                            </motion.div>
                            <hr />
                        </div>
                    )
                }
            </AnimatePresence>
        </InfiniteScroll>
    )
}