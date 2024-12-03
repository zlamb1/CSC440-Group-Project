import {useFetcher} from "@remix-run/react";
import React, {FormEvent, useRef} from "react";
import {PostEditor, PostEditorElement} from "@components/post/PostEditor";
import {AnimatePresence, motion} from "framer-motion";
import {Button} from "@ui/button";
import RawPost from "@components/post/RawPost";
import {LoadingSpinner} from "@components/LoadingSpinner";
import {usePostStore} from "@/utils/posts/usePostStore";
import {useShallow} from "zustand/react/shallow";
import useMountedEffect from "@/utils/hooks/useMountedEffect";
import {useErrorToast, useSuccessToast, useUnknownErrorToast} from "@/utils/toast";

export default function PostView({
                                   post, isEditing = false, onIsEditingChange = () => {
  }
                                 }: {
  post: any,
  isEditing?: boolean,
  onIsEditingChange?: (isEditing: boolean) => void
}) {
  const fetcher = useFetcher();
  const ref = useRef<PostEditorElement>();

  const {edit, keywords} = usePostStore(useShallow((state: any) => ({
    edit: state.edit,
    keywords: state.keywords,
  })));

  useMountedEffect(() => {
    if (fetcher?.data) {
      if (fetcher.data.success) {
        const isReply = !!post?.replyTo;
        useSuccessToast(`Edited ${isReply ? 'Reply' : 'Story'}`, {duration: 1500});
        onIsEditingChange(false);
        edit(post.id, fetcher?.data?.content, fetcher?.data?.lastEdited);
      } else if (fetcher.data.error) {
        useErrorToast(fetcher.data.error);
      } else {
        useUnknownErrorToast();
      }
    }
  }, [fetcher?.data]);

  function onEdit(evt: FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    if (ref.current) {
      const formData = new FormData();
      formData.set('content', ref.current.getContent());
      fetcher.submit(formData, {
        method: 'POST',
        action: `/posts/${post.id}/edit`
      });
    }
  }

  function getPostContent() {
    if (keywords && keywords.length) {
      const regex = new RegExp('(' + keywords.join('|') + ')', 'gi');
      return post.content.replace(regex, '<span class="filter_highlight">$1</span>');
    }

    return post.content;
  }

  return (
    <div className="flex flex-col gap-3">
      {
        isEditing ?
          <PostEditor editorProps={{attributes: {class: 'focus-visible:outline-none'}}}
                      editable={fetcher.state === 'idle'}
                      content={getPostContent()}
                      autofocus="end"
                      ref={ref}
          /> : <RawPost content={getPostContent()}/>
      }
      <fetcher.Form onSubmit={onEdit}>
        <AnimatePresence mode="wait">
          {
            isEditing ?
              <motion.div initial={{opacity: 0, height: 0}}
                          animate={{opacity: 1, height: 'auto'}}
                          exit={{opacity: 0, height: 0}}
                          transition={{duration: 0.2}}
                          className="flex flex-col gap-4">
                <div className="flex gap-2 justify-end">
                  <Button className="text-red-500 hover:text-red-400"
                          variant="ghost"
                          type="button"
                          disabled={fetcher.state !== 'idle'}
                          onClick={() => onIsEditingChange(false)}>
                    Cancel
                  </Button>
                  <Button containerClass="w-fit" type="submit" disabled={fetcher.state !== 'idle'}>
                    {
                      fetcher.state === 'idle' ?
                        'Edit' : <LoadingSpinner/>
                    }
                  </Button>
                </div>
              </motion.div> : null
          }
        </AnimatePresence>
      </fetcher.Form>
    </div>
  );
}