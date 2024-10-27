import {PostWithUser} from "@/utils/types";
import React, {FormEvent, useRef, useState} from "react";
import {useFetcher} from "@remix-run/react";
import {PostEditor, PostEditorElement} from "@components/post/PostEditor";
import {AnimatePresence, motion} from "framer-motion";
import {Button} from "@ui/button";
import {LoadingSpinner} from "@components/LoadingSpinner";

export default function ReplyEditor({ post, isReplying = true }: { post: PostWithUser, isReplying?: boolean }) {
    const [isEditorActive, setEditorActive] = useState(false);
    const fetcher = useFetcher();
    const ref = useRef<PostEditorElement>();

    const onReply = (evt: FormEvent<HTMLFormElement>) => {
        evt.preventDefault();
        if (ref.current) {
            const formData = new FormData();
            formData.set('content', ref.current.getContent());
            fetcher.submit(formData, {
                method: 'POST',
                action: `/posts/${post.id}/reply`,
            });
        }
    }

    function handleCancel(evt: React.MouseEvent) {
        evt.stopPropagation();
        setEditorActive(false);
    }

    return (
        <AnimatePresence mode="wait" initial={false}>
            {
                isReplying ?
                    <fetcher.Form onSubmit={onReply}>
                        <motion.div className="overflow-y-hidden" initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}>
                            <PostEditor placeholder="Write a reply..."
                                        ref={ref}
                                        isActive={isEditorActive}
                                        focus={setEditorActive}
                                        editable={fetcher.state === 'idle'}
                                        editorProps={{attributes: {class: 'focus-visible:outline-none'}}}
                                        append={
                                            <motion.div initial={{opacity: 0, height: 0}}
                                                        animate={{opacity: 1, height: 'auto'}}
                                                        exit={{opacity: 0, height: 0}}
                                                        className="flex gap-2 justify-end overflow-y-hidden">
                                                <Button variant="ghost" onClick={handleCancel} type="button">
                                                    Cancel
                                                </Button>
                                                <Button type="submit"
                                                        disabled={fetcher.state !== 'idle'}>
                                                    {
                                                        fetcher.state === 'idle' ?
                                                            'Reply' : <LoadingSpinner/>
                                                    }
                                                </Button>
                                            </motion.div>
                                        }
                            />
                        </motion.div>
                    </fetcher.Form>
                    : null
            }
        </AnimatePresence>
    )
}