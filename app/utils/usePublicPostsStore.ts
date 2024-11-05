import {create} from "zustand/react";
import mitt from 'mitt';
import {PostWithRelations, PostWithReplies} from "@/utils/types";
import {Post} from "@prisma/client";
import {emitter, PostEvent} from "@/utils/usePostStore";

function cmp(a: Date, b: Date) {
    if (a > b) {
        return -1;
    } else if (a < b) {
        return 1;
    }

    return 0;
}

const initialState = {
    posts: [],
}

export const usePublicPostsStore = create((set, get: any) => ({
    ...initialState,

    add(posts: (Post | PostWithRelations | PostWithReplies)[]) {
        return set((state: any) => {
            if (!posts || !posts.length) {
                return state;
            }

            const _posts = [...state.posts];

            for (const post of posts) {
                // TODO: implement sorted array
                if (!post?.id) {
                    console.error('[usePublicPostsStore] attempted to add post with null ID');
                    continue;
                }

                _posts.push(post.id);
            }

            return {...state, posts: _posts};
        });
    },

    delete(post: string) {
        return set((state: any) => ({...state, posts: state.posts.filter((_post: string) => _post !== post) }))
    },

    reset() {
        return set(initialState);
    }
}));

// @ts-ignore
emitter.on(PostEvent.DELETE, (post: string) => {
    const state: any = usePublicPostsStore.getState();
    if (state?.delete) {
        state.delete(post);
    }
});