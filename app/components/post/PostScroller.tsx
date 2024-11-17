import {AnimatePresence} from "framer-motion";
import React, {ReactNode, useEffect} from "react";
import Post from "@components/post/Post";
import InfiniteScroll, {InfiniteFetcherParams, useInfiniteScroll} from "@components/InfiniteScroll";
import useIsSSR from "@/utils/hooks/useIsSSR";
import {PostWithDate} from "@/utils/posts/useVirtualizedPosts";

export interface PostScrollerProps {
    posts: PostWithDate[];
    fetcher: (params: InfiniteFetcherParams) => Promise<void>;
    onLoad?: (isLoading: boolean) => void;
    empty?: ReactNode;
}

export default function PostScroller({ posts, fetcher, onLoad, empty }: PostScrollerProps) {
    const [ isLoading, _onLoad ] = useInfiniteScroll({ fetcher });
    const isSSR = useIsSSR();

    useEffect(() => {
        onLoad?.(isLoading);
    }, [isLoading]);

    const isEmpty = !posts || !posts.length;

    return (
        <InfiniteScroll onLoad={_onLoad} isLoading={isLoading} empty={empty} isEmpty={isEmpty}>
            <AnimatePresence initial={!isSSR}>
                {
                    posts?.map(post =>
                        <div className="flex flex-col" key={post.id}>
                            <Post className="p-3 px-5" id={post.id} />
                            <hr />
                        </div>
                    )
                }
            </AnimatePresence>
        </InfiniteScroll>
    )
}