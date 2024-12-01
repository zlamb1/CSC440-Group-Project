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
      get().reply({parentId: post.replyTo, replyId: post.id});
    }

    set((state: any) => ({...state, [post.id]: post}));

    if (emit) {
      emitter.emit(PostEvent.CREATE, {post});
    }
  },

  edit(id: string, content: string, lastEdited: string | Date, emit?: boolean) {
    if (emit == null) emit = true;
    let shouldEmit = false;

    set((state: any) => {
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

      shouldEmit = emit;
      return {...state, [id]: post};
    });

    if (shouldEmit) {
      emitter.emit(PostEvent.EDIT, {post: id, content, lastEdited});
    }
  },

  like({id, liked, emit = true}: { id: string, liked: boolean | null, emit?: boolean }) {
    let shouldEmit = false;

    set((state: any) => {
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

      shouldEmit = emit;

      return {...state, [id]: post};
    });

    if (shouldEmit) {
      emitter.emit(PostEvent.LIKE, {post: id, liked});
    }
  },

  genre({post, genre, remove, emit = true}: { post: string, genre: string, remove?: boolean, emit?: boolean }) {
    if (!post) {
      return console.error('[usePostStore] cannot update genre for null post');
    }

    if (!genre) {
      return console.error('[usePostStore] cannot update post with null genre');
    }

    let shouldEmit = false;

    set((state: any) => {
      const _post = {...state[post]};

      if (!_post) {
        return state;
      }

      const indexOf = _post.genres?.indexOf?.(genre);
      if (remove) {
        if (indexOf > -1) {
          _post.genres.splice(indexOf, 1);
        }
      } else {
        if (indexOf < 0) {
          _post.genres.push(genre);
        }
      }

      shouldEmit = emit;

      return {...state, [post]: _post};
    });

    if (shouldEmit) {
      emitter.emit(PostEvent.GENRE, {post, genre, remove});
    }
  },

  reply({parentId, replyId, modifyReplyCount = true}: {
    parentId: string,
    replyId: string,
    modifyReplyCount?: boolean
  }) {
    return set((state: any) => {
      const parent = {...state[parentId]};
      if (parent) {
        if (!parent.replies || !parent.replies.length) {
          parent.replies = [];
        }

        const len = parent.replies.length;
        // add replyId to parent replies if it isn't already there
        parent.replies = [...new Set([...parent.replies, replyId])];

        if (modifyReplyCount) {
          const newLen = parent.replies.length;
          if (newLen > len) {
            parent.replyCount = parent.replyCount ? Math.max(parent.replyCount + 1, newLen) : newLen;
          }
        }

        return {...state, [parent.id]: parent};
      }

      return state;
    });
  },

  set(post: PostWithReplies) {
    return set((state: any) => ({...state, [post.id]: post}));
  },

  add(posts: (string | PostWithRelations | PostWithReplies)[], emit?: boolean) {
    if (!emit) emit = true;
    const emitPosts: any = [];

    set((state: any) => {
      if (posts && posts?.length) {
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
              if (post?.replies) {
                post.replies = [];
              } else {
                post.replies = null;
              }
            }

            // add post to replies of replyTo
            const replyTo = post.replyTo;
            if (replyTo && get()[replyTo]) {
              get().reply({parentId: replyTo, replyId: post.id});
            }

            // add post to state
            get()[post.id] = post;
            if (emit) {
              emitPosts.push(post);
            }
          } else {
            console.error('[usePostStore] attempted to store post with null id');
          }
        }

        return get();
      }

      return state;
    });

    for (const post of emitPosts) {
      emitter.emit(PostEvent.LOAD, {post});
    }
  },

  delete({post, deleteReply = true, emit = true}: {
    post: string | Post | PostWithReplies | PostWithRelations,
    deleteReply?: boolean,
    emit?: boolean
  }) {
    let shouldEmit = false;

    set((state: any) => {
      const isString = typeof post === 'string';
      const id = isString ? post : post.id;

      if (!id) {
        return state;
      }

      const _state = {[id]: undefined};

      if (deleteReply && !isString && post.replyTo) {
        // remove from parent replies
        get().deleteReply({id, replyTo: post.replyTo});
      }

      // delete replies
      if (!isString && 'replies' in post && post.replies?.length) {
        for (const reply of post.replies) {
          get().delete({post: reply});
        }
      }

      shouldEmit = emit;

      return {...state, ..._state};
    });

    if (shouldEmit) {
      emitter.emit(PostEvent.DELETE, {post});
    }
  },

  deleteReply({id, replyTo}: { id: string, replyTo: string }) {
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

  filter({filter}: { filter: string }) {
    emitter.emit(PostEvent.FILTER, {filter});
  },

  reset() {
    return set({});
  }
}));