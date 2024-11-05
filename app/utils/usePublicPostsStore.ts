import {create} from "zustand/react";
import {PostWithRelations, PostWithReplies} from "@/utils/types";
import {Post} from "@prisma/client";

export const usePublicPostsStore = create((set, get: any) => ({
    posts: [],

    add(posts: (string | Post | PostWithRelations | PostWithReplies)[]) {
        return set((state: any) => {
            if (!posts || !posts.length) {
                return state;
            }

            const _posts = [...state.posts];

            for (const post of posts) {
                // TODO: implement sorted array
                if (typeof post === 'string') {
                    _posts.push(post);
                } else {
                    if (!post?.id) {
                        console.error('[usePublicPostsStore] attempted to add post with null ID');
                        continue;
                    }

                    _posts.push(post.id);
                }
            }

            return {...state, posts: _posts};
        });
    }
}));