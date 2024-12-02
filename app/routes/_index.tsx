import {Form, useFetcher} from "@remix-run/react";
import {Button} from "@ui/button";
import {PostEditor, PostEditorElement} from "@components/post/PostEditor";
import React, {createRef, FormEvent, useContext, useState} from "react";
import UserAvatar from "@components/user/UserAvatar";
import ProgressCircle from "@components/ProgressCircle";
import {LoadingSpinner} from "@components/LoadingSpinner";
import Fade from "@ui/fade";
import PostScroller from "@components/post/PostScroller";
import {usePostStore} from "@/utils/posts/usePostStore";
import {usePublicPostsStore} from "@/utils/posts/usePublicPostsStore";
import {useShallow} from "zustand/react/shallow";
import useMountedEffect from "@/utils/hooks/useMountedEffect";
import {UserContext} from "@/utils/context/UserContext";
import Expand from "@ui/expand";
import {useErrorToast, useSuccessToast, useUnknownErrorToast} from "@/utils/toast";

export default function Index() {
  const user = useContext(UserContext);

  const [editorProgress, setEditorProgress] = useState<number>(0);
  const [isEditorActive, setEditorActive] = useState<boolean>(false);

  const {create} = usePostStore(useShallow((state: any) => ({create: state.create})));
  const {fetch, posts} = usePublicPostsStore(useShallow((state: any) => ({fetch: state.fetch, posts: state.posts})));

  const fetcher = useFetcher();
  const ref = createRef<PostEditorElement>();

  useMountedEffect(() => {
    if (fetcher?.data) {
      if (fetcher.data.post) {
        useSuccessToast('Created Story', {duration: 1500});
        create(fetcher.data.post);
        if (ref.current) {
          ref.current.clearEditor();
        }
      } else if (fetcher.data.error) {
        useErrorToast(fetcher.data.error);
      } else {
        useUnknownErrorToast();
      }
    }
  }, [fetcher?.data]);

  function onSubmit(evt: FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    if (ref.current) {
      const formData = new FormData();
      formData.set('content', ref.current.getContent());

      fetcher.submit(formData, {
        action: '/posts/create',
        method: 'POST',
      });
    }
  }

  function handleCancel(evt: React.MouseEvent) {
    evt.stopPropagation();
    setEditorActive(false);
  }

  return (
    <div className="flex flex-col w-full">
      <Fade show={!!user?.loggedIn}>
        <Form navigate={false} className="flex flex-col gap-3 p-3 px-5" onSubmit={onSubmit}>
          <div className="flex gap-3">
            <UserAvatar avatar={user?.avatarPath} userName={user?.userName} className="flex-shrink-0 mt-[2px]"/>
            <PostEditor ref={ref}
                        focus={setEditorActive}
                        isActive={isEditorActive}
                        placeholder="Write a story..."
                        onTextUpdate={(progress: number) => setEditorProgress(progress)}
                        editable={fetcher.state === 'idle'}
                        editorProps={{attributes: {class: 'break-all py-1 focus-visible:outline-none'}}}
                        containerProps={{className: 'flex-grow w-full text-md'}}
                        append={
                          <Expand className="self-end flex items-center overflow-y-hidden gap-1" show={isEditorActive}>
                            <ProgressCircle percentage={editorProgress}/>
                            <Button type="button" variant="ghost" onClick={handleCancel}>
                              Cancel
                            </Button>
                            <Button className="font-bold" type="submit"
                                    disabled={fetcher.state !== 'idle'}>
                              {fetcher.state === 'idle' ? 'Post' : <LoadingSpinner/>}
                            </Button>
                          </Expand>
                        }
            />
          </div>
        </Form>
        <hr/>
      </Fade>
      <PostScroller posts={posts} fetcher={fetch}/>
    </div>
  )
}