import {usePostStore} from "@/utils/posts/usePostStore";
import {InfiniteFetcherParams} from "@components/InfiniteScroll";
import useVirtualizedPosts from "@/utils/posts/useVirtualizedPosts";

async function fetcher(set: any, get: any, { setHasMoreData }: InfiniteFetcherParams) {
    const cursor = get().posts?.[get().posts?.length - 1]?.postedAt ?? new Date();
    const limit = get().limit;

    const params = new URLSearchParams();
    params.set('cursor', cursor.toString());
    params.set('limit', limit.toString());

    const response = await fetch('/posts/public?' + params);
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

export const usePublicPostsStore = useVirtualizedPosts({ fetcher });