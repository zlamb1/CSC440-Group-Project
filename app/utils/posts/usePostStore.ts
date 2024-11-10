import {create} from "zustand/react";
import {PostWithRelations, PostWithReplies} from "@/utils/types";
import {Post} from "@prisma/client";
import {emitter, PostEvent} from "@/utils/posts/usePostEvents";

export const usePostStore = create((set, get: any) => ({
    create(post: PostWithRelations, emit?: boolean) {
        if (emit == null) emit = true;

        post.liked = null;
        post.likeCount = 0;
        post.replyCount = 0;
        post.replies = [];

        if (post.replyTo) {
            get().reply(post.replyTo, post.id);
        }

        if (emit) {
            emitter.emit(PostEvent.CREATE, { post });
        }

        return set((state: any) => ({...state, [post.id]: post}));
    },

    edit(id: string, content: string, lastEdited: string | Date, emit?: boolean) {
        if (emit == null) emit = true;

        return set((state: any) => {
            if (!id) {
                console.error('[usePostStore] attempted to edit post with null ID');
                return state;
            }

            if (!id) {
                console.error('[usePostStore] attempted to edit post with null content');
                return state;
            }

            const post = {...state[id]};

            if (!post) {
                console.error(`[usePostStore] attempted to edit null post: ${id}`);
                return state;
            }

            // update post content & lastEdited
            post.content = content;
            lastEdited = lastEdited ?? new Date();
            post.lastEdited = typeof lastEdited === 'string' ? new Date(lastEdited) : lastEdited;

            if (emit) {
                emitter.emit(PostEvent.EDIT, { post: id, content, lastEdited });
            }

            return {...state, [id]: post};
        });
    },

    like(id: string, liked: boolean | null, emit?: boolean) {
        if (emit == null) emit = true;

        return set((state: any) => {
            const post = {...state[id]};
            if (!post) {
                console.error(`[usePostStore] attempted to like null post: ${id}`);
                return state;
            }

            if (liked !== post.liked) {
                if (liked === null) {
                    post.likeCount += (post.liked ? -1 : 1);
                } else {
                    post.likeCount += (liked ? 1 : -1) * (post.liked === null ? 1 : 2);
                }
            }

            post.liked = liked;

            if (emit) {
                emitter.emit(PostEvent.LIKE, {post: id, liked});
            }

            return {...state, [id]: post};
        });
    },

    reply(parentId: string, replyId: string) {
        return set((state: any) => {
            const parent = {...state[parentId]};
            if (parent) {
                if (!parent.replies || !parent.replies.length) {
                    parent.replies = [];
                }

                const len = parent.replies.length;
                // add replyId to parent replies if it isn't already there
                parent.replies = [...new Set([...parent.replies, replyId])];

                const newLen = parent.replies.length;
                if (newLen > len) {
                    parent.replyCount = parent.replyCount ? Math.max(parent.replyCount + 1, newLen) : newLen;
                }

                return {...state, [parent.id]: parent};
            }

            return state;
        });
    },

    set(post: PostWithReplies) {
        return set((state: any) => ({ ...state, [post.id]: post }));
    },

    add(posts: (string | PostWithRelations | PostWithReplies)[], emit?: boolean) {
        if (!emit) emit = true;

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
                        emitter.emit(PostEvent.LOAD, { post });
                    } else {
                        console.error('[usePostStore] attempted to store post with null id');
                    }
                }

                return _state;
            }

            return state;
        });
    },

    delete({ post, deleteReply = true, emit = true }: { post: string | Post | PostWithReplies | PostWithRelations, deleteReply?: boolean, emit?: boolean }) {
        return set((state: any) => {
            const isString = typeof post === 'string';
            const id = isString ? post : post.id;

            if (!id) {
                return state;
            }

            const _state = { [id]: undefined };

            if (deleteReply && !isString && post.replyTo) {
                // remove from parent replies
                get().deleteReply({ id, replyTo: post.replyTo });
            }

            // delete replies
            if (!isString && 'replies' in post && post.replies.length) {
                for (const reply of post.replies) {
                    get().delete({ post: reply });
                }
            }

            if (emit) {
                emitter.emit(PostEvent.DELETE, { post });
            }

            return {...state, ..._state};
        });
    },

    deleteReply({ id, replyTo }: { id: string, replyTo: string }) {
        return set((state: any) => {
            if (!id || !replyTo) {
                console.error(`[usePostStore] attempted to delete reply with null ID or replyTo: [${id}, ${replyTo}]`);
                return state;
            }

            const parent = {...state[replyTo]};
            if (!parent) {
                return state;
            }

            const indexOf = parent.replies?.indexOf?.(id);
            if (indexOf > -1) {
                parent.replies.splice(indexOf, 1);
                parent.replyCount = Math.max(parent.replyCount - 1, parent.replies.length);
            }

            return {...state, [replyTo]: parent};
        });
    },

    reset() {
        return set({});
    }
}));