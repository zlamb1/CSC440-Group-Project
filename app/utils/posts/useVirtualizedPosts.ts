import {create} from "zustand/react";
import {InfiniteFetcherParams} from "@components/InfiniteScroll";
import {PostWithRelations, PostWithReplies} from "@/utils/types";
import {Post} from "@prisma/client";
import {emitter, PostEvent} from "@/utils/posts/usePostEvents";
import {usePostStore} from "@/utils/posts/usePostStore";

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

enum ComparisonOperation {
  EQ, LT, GT, LTE, GTE
}

function parseNumericAttribute(attribute: string, value: string) {
  const numericValue = parseInt(value);
  for (let i = 0; i < attribute?.length; i++) {
    const char = attribute.charAt(i), nextChar = attribute.charAt(i + 1);
    switch (char) {
      case '=':
        return {attribute: attribute.substring(0, i), value: numericValue, op: ComparisonOperation.EQ};
      case '>':
        return {
          attribute: attribute.substring(0, i),
          value: numericValue,
          op: nextChar === '=' ? ComparisonOperation.LTE : ComparisonOperation.LT
        };
      case '<':
        return {
          attribute: attribute.substring(0, i),
          value: numericValue,
          op: nextChar === '=' ? ComparisonOperation.GTE : ComparisonOperation.GT
        };
    }
  }

  return {attribute, value: numericValue, op: ComparisonOperation.LTE};
}

function applyNumericComparison(value: number, realValue: number, op: ComparisonOperation) {
  switch (op) {
    case ComparisonOperation.EQ:
      return value === realValue;
    case ComparisonOperation.LT:
      return value < realValue;
    case ComparisonOperation.GT:
      return value > realValue;
    case ComparisonOperation.LTE:
      return value <= realValue;
    case ComparisonOperation.GTE:
      return value >= realValue;
    default:
      return false;
  }
}

function _filterFn(filter: string, posts: PostWithDate[]) {
  // get post store data
  const state: any = usePostStore.getState();

  const attributes = filter?.split?.(' ');
  if (attributes) {
    for (const attributePair of attributes) {
      if (attributePair.includes('::')) {
        const pair = attributePair.split('::');
        if (pair.length < 2) continue;
        const attribute = pair[0];
        const value = pair[1];
        if (!attribute || !value) continue;
        switch (attribute.toLowerCase()) {
          case 'genre':
            posts = posts.filter(post => state[post.id]?.genres?.includes?.(value.toUpperCase()))
            break;
          case 'liked':
            const _value = (value === '1' || value === 'true' || value === 't');
            posts = posts.filter(post => state[post.id]?.liked === _value);
            break;
          default:
            const numericAttribute = parseNumericAttribute(attribute, value);
            switch (numericAttribute?.attribute) {
              case 'likes':
                posts = posts.filter(post => applyNumericComparison(numericAttribute.value, state[post.id]?.likeCount, numericAttribute.op));
                break;
              case 'replies':
                posts = posts.filter(post => applyNumericComparison(numericAttribute.value, state[post.id]?.replyCount, numericAttribute.op));
                break;
            }
            break;
        }
      } else {
        posts = posts.filter(post => state[post.id]?.content?.includes?.(attributePair));
      }
    }
  }

  return posts;
}

export interface VirtualizedPostsProps {
  name?: string;
  fetcher: (set: any, get: any, params: InfiniteFetcherParams) => Promise<void>;
  limit?: number;
  state?: object;
  filterFn?: (filter: string, posts: PostWithDate[]) => PostWithDate[];
  includeFn?: (post: Post | PostWithReplies | PostWithRelations) => boolean;
}

export default function useVirtualizedPosts({
                                              name = "useVirtualizedPosts",
                                              fetcher,
                                              limit = DEFAULT_LIMIT,
                                              state,
                                              includeFn,
                                              filterFn = _filterFn
                                            }: VirtualizedPostsProps) {
  const initialState = {
    posts: [], _posts: [], limit, filter: '', ...state
  };

  const store = create((set, get: any) => ({
    ...initialState,

    fetch(params: InfiniteFetcherParams) {
      return fetcher(set, get, params);
    },

    add(posts: (Post | PostWithRelations | PostWithReplies)[]) {
      if (includeFn) {
        posts = posts?.filter?.(includeFn);
      }

      return set((state: any) => {
        if (!posts || !posts.length) {
          return state;
        }

        const _posts = [...state._posts];

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

        return {...state, posts: filterFn(state.filter, _posts), _posts};
      });
    },

    delete(post: string | Post | PostWithReplies | PostWithRelations) {
      const id = typeof post === 'string' ? post : post.id;
      return set((state: any) => ({
        ...state,
        posts: state.posts.filter((post: PostWithDate) => post.id !== id),
        _posts: state._posts.filter((post: PostWithDate) => post.id !== id)
      }));
    },

    _filter(options?: { filter: string }) {
      if (!options) {
        // re-filter results
        return set((state: any) => ({...state, posts: filterFn(state.filter, state._posts)}))
      }
      return set((state: any) => ({...state, filter: options?.filter, posts: filterFn(options?.filter, state._posts)}));
    },

    reset() {
      return set(initialState);
    }
  }));

  emitter.on(PostEvent.CREATE, ({post}: any) => {
    const state: any = store.getState();
    if (state?.add) {
      state.add([post]);
    }
  });

  emitter.on(PostEvent.DELETE, ({post}: any) => {
    const state: any = store.getState();
    if (state?.delete) {
      state.delete(post);
    }
  });

  emitter.on(PostEvent.LIKE, () => {
    const state: any = store.getState();
    if (state?.filter) {
      state._filter();
    }
  });

  emitter.on(PostEvent.EDIT, () => {
    const state: any = store.getState();
    if (state?._filter) {
      state._filter();
    }
  });

  emitter.on(PostEvent.FILTER, ({filter}: any) => {
    const state: any = store.getState();
    if (state?._filter) {
      state._filter({filter});
    }
  });

  return store;
}