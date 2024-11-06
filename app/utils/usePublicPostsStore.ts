import {create} from "zustand/react";
import {PostWithRelations, PostWithReplies} from "@/utils/types";
import {Post} from "@prisma/client";
import {emitter, PostEvent, usePostStore} from "@/utils/usePostStore";
import {FetchParams} from "@components/InfiniteScroll";

type PostWithDate = {
    id: string;
    date: Date;
}

function cmp(a: PostWithDate, b: PostWithDate) {
    if (a.date > b.date) {
        return -1;
    } else if (a.date < b.date) {
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

const initialState = {
    postsWithDate: [],
    posts: [],
    limit: 5,
};

export const usePublicPostsStore = create((set, get: any) => ({
    ...initialState,

    async fetch({ setHasMoreData }: FetchParams<PostWithRelations>) {
        const cursor = get().postsWithDate?.[get().postsWithDate?.length - 1]?.date ?? new Date();
        const limit = get().limit ?? 10;

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
    },

    add(posts: (Post | PostWithRelations | PostWithReplies)[]) {
        return set((state: any) => {
            if (!posts || !posts.length) {
                return state;
            }

            let postsWithDate = [...state.postsWithDate];

            for (const post of posts) {
                if (post.replyTo) continue;

                if (!post?.id || !post?.postedAt) {
                    console.error('[usePublicPostsStore] attempted to add post with null ID or postedAt');
                    continue;
                }

                const postWithDate: PostWithDate = {
                    id: post.id,
                    date: post.postedAt
                };

                // O(log(n))
                const index = binarySearch(postWithDate, postsWithDate);
                if (index < 0) {
                    postsWithDate.splice(Math.abs(index + 1), 0, postWithDate);
                }
            }

            return {...state, postsWithDate, posts: postsWithDate.map(post => post.id)};
        });
    },

    delete(post: string | Post | PostWithReplies | PostWithRelations) {
        const id = typeof post === 'string' ? post : post.id;
        return set((state: any) => ({
            ...state,
            postsWithDate: state.postsWithDate.filter((postWithDate: PostWithDate) => postWithDate.id !== id),
            posts: state.posts.filter((post: string) => post !== id)
        }));
    },

    reset() {
        return set(initialState);
    }
}));

emitter.on(PostEvent.CREATE, ({ post }: any) => {
    const state: any = usePublicPostsStore.getState();
    if (state?.add) {
        state.add([post]);
    }
});

emitter.on(PostEvent.DELETE, ({ post }: any) => {
    const state: any = usePublicPostsStore.getState();
    if (state?.delete) {
        state.delete(post);
    }
});