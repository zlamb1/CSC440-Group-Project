import {UserWithLoggedIn} from "@/utils/types";
import {AnimatePresence, motion} from "framer-motion";
import React, {ReactNode, useEffect} from "react";
import Post from "@components/post/Post";
import InfiniteScroll, {InfiniteFetcherParams, useInfiniteScroll} from "@components/InfiniteScroll";
import useIsSSR from "@/utils/hooks/useIsSSR";
import {PostWithDate} from "@/utils/posts/useVirtualizedPosts";
import Fade from "@ui/fade";

export interface PostScrollerProps {
    posts: PostWithDate[];
    user: UserWithLoggedIn;
    fetcher: (params: InfiniteFetcherParams) => Promise<void>;
    onLoad?: (isLoading: boolean) => void;
    empty?: ReactNode;
}

export default function PostScroller({ posts, user, fetcher, onLoad, empty }: PostScrollerProps) {
    const [ isLoading, _onLoad ] = useInfiniteScroll({ fetcher });
    const isSSR = useIsSSR();

    useEffect(() => {
        onLoad?.(isLoading);
    }, [isLoading]);

    const isEmpty = (!posts || !posts.length) && !isLoading;

    return (
        <InfiniteScroll onLoad={_onLoad} isLoading={isLoading}>
            <AnimatePresence initial={!isSSR}>
                {
                    posts?.map(post =>
                        <div className="flex flex-col" key={post.id}>
                            <Post className="p-3 px-5" id={post.id} viewer={user} />
                            <hr />
                        </div>
                    )
                }
            </AnimatePresence>
            <Fade duration={0.25} show={isEmpty}>
                { empty }
            </Fade>
        </InfiniteScroll>
    )
}