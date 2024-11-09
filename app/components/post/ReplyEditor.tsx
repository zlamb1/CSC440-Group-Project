import {PostWithUser} from "@/utils/types";
import React, {FormEvent, useRef, useState} from "react";
import {PostEditor, PostEditorElement} from "@components/post/PostEditor";
import {AnimatePresence, motion} from "framer-motion";
import {Button} from "@ui/button";
import {LoadingSpinner} from "@components/LoadingSpinner";
import {usePostStore} from "@/utils/posts/usePostStore";
import {useShallow} from "zustand/react/shallow";
import {Form} from "@remix-run/react";

export default function ReplyEditor({ post, isReplying = true }: { post: PostWithUser, isReplying?: boolean }) {
    const [isEditorActive, setEditorActive] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const ref = useRef<PostEditorElement>();

    const { create } = usePostStore(useShallow((state: any) => ({ create: state.create })));

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
                    create(data.post);
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
        <AnimatePresence mode="wait" initial={false}>
            {
                isReplying ?
                    <Form navigate={false} onSubmit={onReply}>
                        <motion.div className="overflow-y-hidden" initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}>
                            <PostEditor placeholder="Write a reply..."
                                        ref={ref}
                                        isActive={isEditorActive}
                                        focus={setEditorActive}
                                        editable={!isPending}
                                        editorProps={{attributes: {class: 'break-all focus-visible:outline-none'}}}
                                        append={
                                            <motion.div initial={{opacity: 0, height: 0}}
                                                        animate={{opacity: 1, height: 'auto'}}
                                                        exit={{opacity: 0, height: 0}}
                                                        className="flex gap-2 justify-end overflow-y-hidden">
                                                <Button variant="ghost" onClick={handleCancel} type="button">
                                                    Cancel
                                                </Button>
                                                <Button type="submit"
                                                        disabled={isPending}>
                                                    {
                                                        isPending ? <LoadingSpinner /> : 'Reply'
                                                    }
                                                </Button>
                                            </motion.div>
                                        }
                            />
                        </motion.div>
                    </Form>
                    : null
            }
        </AnimatePresence>
    )
}