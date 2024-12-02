import {PostWithUser} from "@/utils/types";
import React, {FormEvent, useRef, useState} from "react";
import {PostEditor, PostEditorElement} from "@components/post/PostEditor";
import {Button} from "@ui/button";
import {LoadingSpinner} from "@components/LoadingSpinner";
import {usePostStore} from "@/utils/posts/usePostStore";
import {useShallow} from "zustand/react/shallow";
import {Form} from "@remix-run/react";
import ProgressCircle from "@components/ProgressCircle";
import Expand from "@ui/expand";
import {useErrorToast, useSuccessToast, useUnknownErrorToast} from "@/utils/toast";

export default function ReplyEditor({post, isReplying = true}: { post: PostWithUser, isReplying?: boolean }) {
  const [isEditorActive, setEditorActive] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [editorProgress, setEditorProgress] = useState<number>(0);
  const ref = useRef<PostEditorElement>();

  const {create} = usePostStore(useShallow((state: any) => ({create: state.create})));

  const onReply = (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    if (ref.current) {
      const formData = new FormData();
      formData.set('content', ref.current.getContent());

      setIsPending(true);

      fetch(`/posts/${post.id}/reply`, {
        method: 'POST',
        body: formData,
      }).then(async res => {
        if (ref.current) {
          ref.current.clearEditor();
        }

        const data = await res.json();
        if (data?.post) {
          useSuccessToast('Created Reply');
          create(data.post);
        } else if (data?.error) {
          useErrorToast(data.error);
        } else {
          useUnknownErrorToast();
        }
      }).finally(() => {
        setIsPending(false);
      });
    }
  }

  function handleCancel(evt: React.MouseEvent) {
    evt.stopPropagation();
    setEditorActive(false);
    if (ref.current) {
      ref.current.clearEditor();
    }
  }

  return (
    <Expand className="overflow-y-hidden" show={isReplying} initial={false}>
      <Form navigate={false} onSubmit={onReply}>
        <PostEditor placeholder="Write a reply..."
                    ref={ref}
                    isActive={isEditorActive}
                    focus={setEditorActive}
                    editable={!isPending}
                    editorProps={{attributes: {class: 'break-all focus-visible:outline-none'}}}
                    onTextUpdate={(progress: number) => setEditorProgress(progress)}
                    append={
                      <Expand className="overflow-y-hidden flex justify-end gap-1" show={isEditorActive}>
                        <ProgressCircle percentage={editorProgress}/>
                        <Button variant="ghost" onClick={handleCancel} type="button">
                          Cancel
                        </Button>
                        <Button type="submit"
                                disabled={isPending}>
                          {
                            isPending ? <LoadingSpinner/> : 'Reply'
                          }
                        </Button>
                      </Expand>
                    }
        />
      </Form>
    </Expand>
  );
}