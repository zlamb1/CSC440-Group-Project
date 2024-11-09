import {create} from "zustand/react";
import useVirtualizedPosts from "@/utils/posts/useVirtualizedPosts";
import {InfiniteFetcherParams} from "@components/InfiniteScroll";
import {usePostStore} from "@/utils/posts/usePostStore";

async function fetcher(set: any, get: any, { setHasMoreData }: InfiniteFetcherParams) {
    const id = get().id;
    const cursor = get().posts?.[get().posts?.length - 1]?.postedAt ?? new Date();
    const limit = get().limit;
    const liked = get().liked;

    const params = new URLSearchParams();
    params.set('cursor', cursor.toString());
    params.set('limit', limit.toString());
    params.set('liked', Boolean(liked?.toString()).toString());

    const response = await fetch(`/users/${id}/posts/?` + params);
    const json = await response.json();
    const posts = json?.posts;

    setHasMoreData(posts?.length === limit);

    const postStore: any = usePostStore.getState();
    if (posts?.length) {
        postStore.add(posts);
        get().add(posts);
    }

    return set((state: any) => state);
}

export default function useProfilePosts(userId: string) {
    return create((set, get: any) => ({
        id: userId,
        profilePosts: useVirtualizedPosts({state: {id: userId}, fetcher: fetcher}),
        likedPosts: useVirtualizedPosts({state: {id: userId, liked: true}, fetcher: fetcher}),
    }));
}