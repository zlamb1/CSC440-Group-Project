import {create} from "zustand/react";
import {PostWithRelations, PostWithReplies} from "@/utils/types";
import {Post} from "@prisma/client";
import {emitter, PostEvent, usePostStore} from "@/utils/usePostStore";
import {FetchParams} from "@components/InfiniteScroll";

function cmp(a: Date, b: Date) {
    if (a > b) {
        return 1;
    } else if (a < b) {
        return -1;
    }

    return 0;
}

const initialState = {
    posts: [],
    oldestDate: null
};

export const usePublicPostsStore = create((set, get: any) => ({
    ...initialState,

    async fetch({ doUpdate, setHasMoreData }: FetchParams<PostWithRelations>) {
        const cursor = get().oldestDate ?? new Date();
        const limit = 1;

        const params = new URLSearchParams();
        params.set('cursor', cursor.toString());
        params.set('limit', limit.toString());

        const response = await fetch('/posts/public?' + params);
        const json = await response.json();
        const posts = json?.posts;

        // setHasMoreData(json?.posts?.length === limit);
        setHasMoreData(false);

        const postStore: any = usePostStore.getState();
        if (doUpdate && posts?.length && postStore) {
            postStore?.add?.(posts);
            get()?.add?.(posts);
        }
    },

    add(posts: (Post | PostWithRelations | PostWithReplies)[]) {
        return set((state: any) => {
            if (!posts || !posts.length) {
                return state;
            }

            let _posts = [...state.posts];

            for (const post of posts) {
                // TODO: implement sorted array
                if (!post?.id) {
                    console.error('[usePublicPostsStore] attempted to add post with null ID');
                    continue;
                }

                _posts.push(post.id);
            }

            _posts = [...new Set(_posts)].sort(cmp);

            return {...state, posts: _posts, oldestDate: _posts.length ? _posts[_posts.length - 1] : null};
        });
    },

    delete(post: string) {
        return set((state: any) => ({...state, posts: state.posts.filter((_post: string) => _post !== post) }))
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