import {create} from "zustand/react";
import {InfiniteFetcherParams} from "@components/InfiniteScroll";
import {PostWithRelations, PostWithReplies} from "@/utils/types";
import {Post} from "@prisma/client";
import {emitter, PostEvent} from "@/utils/usePostEvents";

const DEFAULT_LIMIT = 5;

export type PostWithDate = {
    id: string;
    postedAt: Date;
}

function cmp(a: PostWithDate, b: PostWithDate) {
    if (a.postedAt > b.postedAt) {
        return -1;
    } else if (a.postedAt < b.postedAt) {
        return 1;
    }

    return 0;
}

function binarySearch(element: PostWithDate, array: PostWithDate[]) {
    let low = 0, high = array.length - 1, mid = -1;
    while (low <= high) {
        mid = low + Math.floor((high - low) / 2);
        const _cmp = cmp(element, array[mid]);
        if (_cmp > 0) {
            low = mid + 1;
        } else if (_cmp < 0) {
            high = mid - 1;
        } else {
            return mid;
        }
    }

    return -(low + 1);
}

export default function useVirtualizedPosts({ name = "useVirtualizedPosts", fetcher, limit = DEFAULT_LIMIT }:
{ name?: string, fetcher: (set: any, get: any, params: InfiniteFetcherParams) => Promise<void>, limit?: number }) {
    const initialState = {
        posts: [], limit
    };

    const store = create((set, get: any) => ({
        ...initialState,

        fetch: (params: InfiniteFetcherParams) => {
            return fetcher(set, get, params);
        },

        add(posts: (Post | PostWithRelations | PostWithReplies)[]) {
            return set((state: any) => {
                if (!posts || !posts.length) {
                    return state;
                }

                const _posts = [...state.posts];

                for (const post of posts) {
                    if (post.replyTo) continue;

                    if (!post?.id) {
                        console.error(`[${name}] attempted to add post with null ID`);
                        continue;
                    }

                    if (!post?.postedAt) {
                        console.error(`[${name}] attempted to add post with null postedAt`);
                        continue;
                    }

                    const postWithDate: PostWithDate = {
                        id: post.id,
                        postedAt: post.postedAt
                    };

                    // O(log(n))
                    const index = binarySearch(postWithDate, _posts);
                    if (index < 0) {
                        _posts.splice(Math.abs(index + 1), 0, postWithDate);
                    }
                }

                return {...state, posts: _posts};
            });
        },

        delete(post: string | Post | PostWithReplies | PostWithRelations) {
            const id = typeof post === 'string' ? post : post.id;
            return set((state: any) => ({
                ...state, posts: state.posts.filter((post: PostWithDate) => post.id !== id)
            }));
        },

        reset() {
            return set(initialState);
        }
    }));

    emitter.on(PostEvent.CREATE, ({ post }: any) => {
        const state: any = store.getState();
        if (state?.add) {
            state.add([post]);
        }
    });

    emitter.on(PostEvent.DELETE, ({ post }: any) => {
        const state: any = store.getState();
        if (state?.delete) {
            state.delete(post);
        }
    });

    return store;
}