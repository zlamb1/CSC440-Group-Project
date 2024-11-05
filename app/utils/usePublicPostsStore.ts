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

const initialState = {
    postsWithDate: [],
    posts: [],
    limit: 1,
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
                // TODO: implement sorted array
                if (!post?.id || !post?.postedAt) {
                    console.error('[usePublicPostsStore] attempted to add post with null ID or postedAt');
                    continue;
                }

                postsWithDate.push({id: post.id, date: post.postedAt});
            }

            postsWithDate = [...new Set(postsWithDate)].sort(cmp);

            return {...state, postsWithDate, posts: postsWithDate.map(post => post.id)};
        });
    },

    delete(id: string) {
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

emitter.on(PostEvent.CREATE, post => {
    const state: any = usePublicPostsStore.getState();
    if (state?.add) {
        state.add([post]);
    }
});

emitter.on(PostEvent.DELETE, post => {
    const state: any = usePublicPostsStore.getState();
    if (state?.delete) {
        state.delete(post);
    }
});