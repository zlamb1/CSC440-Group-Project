import {Form, useFetcher, useLoaderData} from "@remix-run/react";
import {Button} from "@ui/button";
import {json, LoaderFunctionArgs} from "@remix-run/node";
import {PostEditor, PostEditorElement} from "@components/PostEditor";
import React, {FormEvent, Fragment, useEffect, useState} from "react";
import Post from "@components/Post";
import {Separator} from "@ui/separator";
import UserAvatar from "@components/UserAvatar";
import ProgressCircle from "@components/ProgressCircle";
import {AnimatePresence, motion} from "framer-motion";
import {LoadingSpinner} from "@components/LoadingSpinner";
import useIsSSR from "@/utils/useIsSSR";

export async function loader({ context }: LoaderFunctionArgs) {
    const posts = await context.db.getPublicPosts();
    return json({ user: context.user, posts });
}

export default function Index() {
    const [ editorProgress, setEditorProgress ] = useState(0);
    const isSSR = useIsSSR(); 
    const data = useLoaderData<typeof loader>();
    const createFetcher = useFetcher();
    const ref = React.createRef<PostEditorElement>();
    function onSubmit(evt: FormEvent<HTMLFormElement>) {
        evt.preventDefault();
        if (ref.current) {
            const formData = new FormData();
            formData.set('content', ref.current?.getContent());
            createFetcher.submit(formData, {
                method: 'POST',
                action: '/create-post',
            });
        }
    }
    useEffect(() => {
        if (ref?.current && createFetcher.state === 'idle') {
            ref.current.clearEditor();
        }
    }, [createFetcher]);
    return (
        <div className="flex flex-col w-full">
            {
                data?.user.loggedIn ? (
                    <Form navigate={false} className="flex flex-col gap-3 p-3 px-5" onSubmit={onSubmit}>
                        <div className="flex gap-3">
                            <UserAvatar userName={data?.user.userName} className="flex-shrink-0 mt-[2px]" />
                            <PostEditor ref={ref}
                                        placeholder="Write a post..."
                                        onTextUpdate={(progress: number) => setEditorProgress(progress)}
                                        editable={ createFetcher.state === 'idle' }
                                        editorProps={{ attributes: { class: 'break-all py-1 focus-visible:outline-none' } }}
                                        containerProps={{className: 'flex-grow w-full text-lg'}} />
                        </div>
                        <Separator />
                        <div className="self-end flex items-center gap-3">
                            <ProgressCircle percentage={ editorProgress } />
                            <Button className="font-bold" type="submit" disabled={createFetcher.state !== 'idle'}>
                                {
                                    createFetcher.state === 'idle' ? 'Post' : <LoadingSpinner />
                                }
                            </Button>
                        </div>
                    </Form>
                ) : null
            }
            <Separator />
            <AnimatePresence initial={!isSSR}>
                {
                    data?.posts.map((post: any, i: number) => {
                        return <Fragment key={post.id}>
                            <motion.div initial={{ opacity: 0.25, transform: 'translateX(-10px)' }}
                                        animate={{ opacity: 1, height: 'auto', transform: 'translateX(0px)' }}
                                        exit={{ opacity: 0.25, height: 0, transform: 'translateX(10px)' }}
                                        transition={{ duration: 0.2 }}>
                                <Post className="p-3 px-5" post={post} user={data?.user} />
                            </motion.div>
                            <Separator />
                        </Fragment>
                    })
                }
            </AnimatePresence>
        </div>
    )
}