import {create} from "zustand/react";
import {PostWithRelations, PostWithReplies} from "@/utils/types";

export const usePostStore = create((set, get: any) => ({
    create(post: PostWithRelations) {
        post.liked = null;
        post.likeCount = 0;
        post.replyCount = 0;
        post.replies = [];
        return set((state: any) => ({...state, [post.id]: post}));
    },

    reply(parentId: string, replyId: string) {
        return set((state: any) => {
            const parent = {...state[parentId]};
            if (parent) {
                if (!parent.replies) {
                    parent.replies = [];
                }

                // add replyId to parent replies if it isn't already there
                parent.replies = [...new Set([parent.replies, ...replyId])];
                return {...state, [parent.id]: parent};
            }

            return state;
        });
    },

    add(posts: (string | PostWithRelations | PostWithReplies)[]) {
        return set((state: any) => {
            if (posts && posts?.length) {
                const _state = {...state};
                for (const post of posts) {
                    if (typeof post === 'string')
                        continue;

                    if (post?.id) {
                        // zero initialize aggregate fields
                        post.liked = post.liked ?? null;
                        post.likeCount = post.likeCount ?? 0;
                        post.replyCount = post.replyCount ?? 0;

                        // add replies to state
                        if (post?.replies && post?.replies?.length) {
                            get().add(post.replies);
                            // @ts-ignore
                            post.replies = post.replies.map(post => post?.id || post);
                        } else {
                            post.replies = [];
                        }

                        // add post to replies of replyTo
                        const replyTo = post.replyTo;
                        if (replyTo && _state[replyTo]) {
                            get().reply(replyTo, post.id);
                        }

                        // add post to state
                        _state[post.id] = post;
                    } else {
                        console.error('[usePostStore] attempted to store post with null id');
                    }
                }

                return _state;
            }

            return state;
        });
    },

    reset() {
        return set({});
    }
}));