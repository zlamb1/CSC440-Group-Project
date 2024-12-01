import {create} from "zustand/react";
import useVirtualizedPosts from "@/utils/posts/useVirtualizedPosts";
import {InfiniteFetcherParams} from "@components/InfiniteScroll";
import {usePostStore} from "@/utils/posts/usePostStore";
import {PostEvent} from "@/utils/posts/usePostEvents";

async function fetcher(set: any, get: any, {setHasMoreData}: InfiniteFetcherParams) {
  const id = get().id;
  const cursor = get().posts?.[get().posts?.length - 1]?.postedAt ?? new Date();
  const limit = get().limit;
  const liked = get().liked;

  const params = new URLSearchParams();
  params.set('cursor', cursor.toString());
  params.set('limit', limit.toString());
  params.set('liked', Boolean(liked?.toString()).toString());

  const response = await fetch(`/users/${id}/posts/?` + params);
  const json = await response.json();
  const posts = json?.posts;

  setHasMoreData(posts?.length === limit);

  const postStore: any = usePostStore.getState();
  if (posts?.length) {
    postStore.add({posts});
    get().add(posts);
  }

  return set((state: any) => state);
}

function handleLike({state, evt}: any, viewerId?: string) {
  const post = evt.post;

  if (post) {
    const postState: any = usePostStore.getState();
    const _post = postState[post];
    if (_post && state.id === viewerId) {
      if (evt.liked) {
        state?.add({posts: [_post]});
      } else {
        state?.delete(post);
      }
    }
  }
}

export default function useProfilePosts(userId: string, viewerId?: string) {
  return create((set, get: any) => ({
    id: userId,
    profilePosts: useVirtualizedPosts({state: {id: userId}, fetcher, includeFn: (post) => post.userId === userId}),
    likedPosts: useVirtualizedPosts({
      state: {id: userId, liked: true},
      fetcher,
      excludedEvents: [PostEvent.CREATE],
      eventHandlers: {[PostEvent.LIKE]: (args: any) => handleLike(args, viewerId)}
    }),
  }));
}