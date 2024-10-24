import {Form, useFetcher, useLoaderData} from "@remix-run/react";
import {Button} from "@ui/button";
import {json, LoaderFunctionArgs} from "@remix-run/node";
import {PostEditor, PostEditorElement} from "@components/post/PostEditor";
import React, {FormEvent, Fragment, useEffect, useState} from "react";
import Post from "@components/post/Post";
import UserAvatar from "@components/UserAvatar";
import ProgressCircle from "@components/ProgressCircle";
import {AnimatePresence, motion} from "framer-motion";
import {LoadingSpinner} from "@components/LoadingSpinner";
import useIsSSR from "@/utils/useIsSSR";
import {Prisma, ProfileVisibility} from "@prisma/client";
import Fade from "@ui/fade";

export async function loader({ context }: LoaderFunctionArgs) {
    let posts = await context.prisma.post.findMany({
        where: {
            replyTo: null,
        },
        include: {
            user: {
                where: {
                    visibility: ProfileVisibility.PUBLIC
                }
            },
            postLikes: {
                where: {
                    userId: context.user.id
                },
            },
        },
    });

    posts = posts.map((post: Prisma.PostGetPayload<{ include: { postLikes: true } }>) => {
        if (post?.postLikes && post.postLikes.length > 0) {
            return {
                ...post,
                postLike: post.postLikes[0],
            }
        }

        return post;
    });

    return json({
        user: context.user,
        posts,
    });
}

export default function Index() {
    const [ editorProgress, setEditorProgress ] = useState(0);
    const isSSR = useIsSSR(); 
    const data = useLoaderData<typeof loader>();
    const createFetcher = useFetcher();
    const ref = React.createRef<PostEditorElement>();

    useEffect(() => {
        if (ref?.current && createFetcher.state === 'idle') {
            ref.current.clearEditor();
        }
    }, [createFetcher]);

    function onSubmit(evt: FormEvent<HTMLFormElement>) {
        evt.preventDefault();
        if (ref.current) {
            const formData = new FormData();
            formData.set('content', ref.current.getContent());
            createFetcher.submit(formData, {
                method: 'POST',
                action: '/posts/create',
            });
        }
    }

    return (
        <div className="flex flex-col w-full px-1">
            <Fade show={data?.user.loggedIn}>
                <Form navigate={false} className="flex flex-col gap-3 p-3 px-5" onSubmit={onSubmit}>
                    <div className="flex gap-3">
                        <UserAvatar avatar={data?.user.avatarPath} userName={data?.user.userName} className="flex-shrink-0 mt-[2px]" />
                        <PostEditor ref={ref}
                                    placeholder="Write a post..."
                                    onTextUpdate={(progress: number) => setEditorProgress(progress)}
                                    editable={ createFetcher.state === 'idle' }
                                    editorProps={{ attributes: { class: 'break-all py-1 focus-visible:outline-none' } }}
                                    containerProps={{className: 'flex-grow w-full text-lg'}} />
                    </div>
                    <div className="self-end flex items-center gap-3">
                        <ProgressCircle percentage={ editorProgress } />
                        <Button className="font-bold" type="submit" disabled={createFetcher.state !== 'idle'}>
                            {
                                createFetcher.state === 'idle' ? 'Post' : <LoadingSpinner />
                            }
                        </Button>
                    </div>
                </Form>
                <hr />
            </Fade>
            <AnimatePresence initial={!isSSR}>
                {
                    data?.posts.map((post: any) =>
                        <Fragment key={post.id}>
                            <motion.div initial={{ opacity: 0.25, transform: 'translateX(-10px)' }}
                                        animate={{ opacity: 1, height: 'auto', transform: 'translateX(0px)' }}
                                        exit={{ opacity: 0.25, height: 0, transform: 'translateX(10px)' }}
                                        transition={{ duration: 0.2 }}>
                                <Post className="p-3 px-5" post={post} user={data?.user} />
                            </motion.div>
                            <hr />
                        </Fragment>
                    )
                }
            </AnimatePresence>
        </div>
    )
}