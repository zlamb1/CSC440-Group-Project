import {useFetcher} from "@remix-run/react";
import React, {FormEvent, useRef} from "react";
import {PostEditor, PostEditorElement} from "@components/post/PostEditor";
import {AnimatePresence, motion} from "framer-motion";
import {Button} from "@ui/button";
import RawPost from "@components/post/RawPost";

export default function PostView({ post, isEditing = false, onIsEditingChange = () => {} }: { post: any, isEditing?: boolean, onIsEditingChange?: (isEditing: boolean) => void }) {
    const fetcher = useFetcher();
    const ref = useRef<PostEditorElement>();
    const onEdit = (evt: FormEvent<HTMLFormElement>) => {
        evt.preventDefault();
        if (ref.current) {
            const formData = new FormData();
            formData.set('content', ref.current.getContent());
            fetcher.submit(formData, {
                method: 'POST',
                action: `/post/${post.id}/edit`
            });
        }
    }
    return (
        <>
            {
                isEditing ?
                    <PostEditor editorProps={{attributes: {class: 'focus-visible:outline-none'}}}
                                content={post.content}
                                autofocus="end"
                                ref={ref}
                    /> : <RawPost content={post.content}/>
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
                                            onClick={() => onIsEditingChange(false)}>
                                        Cancel
                                    </Button>
                                    <Button containerClass="w-fit" type="submit">Edit</Button>
                                </div>
                            </motion.div> : null
                    }
                </AnimatePresence>
            </fetcher.Form>
        </>
    );
}