import {Form, useFetcher, useLoaderData} from "@remix-run/react";
import {Button} from "@ui/button";
import {LoaderFunctionArgs} from "@remix-run/node";
import {PostEditor, PostEditorElement} from "@components/post/PostEditor";
import React, {createRef, FormEvent, useEffect, useState} from "react";
import UserAvatar from "@components/user/UserAvatar";
import ProgressCircle from "@components/ProgressCircle";
import {motion} from "framer-motion";
import {LoadingSpinner} from "@components/LoadingSpinner";
import Fade from "@ui/fade";
import EndpointResponse from "@/api/EndpointResponse";
import PostScroller from "@components/post/PostScroller";
import {PostWithRelations} from "@/utils/types";
import {useInfiniteScroll} from "@components/InfiniteScroll";
import {usePostStore} from "@/utils/posts/usePostStore";
import {usePublicPostsStore} from "@/utils/posts/usePublicPostsStore";
import {useShallow} from "zustand/react/shallow";
import useMountedEffect from "@/utils/useMountedEffect";

export async function loader({ context }: LoaderFunctionArgs) {
    return EndpointResponse({ user: context.user });
}

export default function Index() {
    const data = useLoaderData<typeof loader>();

    const [ editorProgress, setEditorProgress ] = useState<number>(0);
    const [ isEditorActive, setEditorActive ] = useState<boolean>(false);

    const { create } = usePostStore(useShallow((state: any) => ({ create: state.create })));
    const { fetch, posts } = usePublicPostsStore(useShallow((state: any) => ({ fetch: state.fetch, add: state.add, posts: state.posts })));

    const [ isLoading, onLoad ] = useInfiniteScroll<PostWithRelations>({ fetchData: fetch });

    const fetcher = useFetcher();
    const ref = createRef<PostEditorElement>();

    useMountedEffect(() => {
        if (fetcher?.data?.post) {
            create(fetcher.data.post);
            if (ref.current) {
                ref.current.clearEditor();
            }

        }
    }, [fetcher.data]);

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
        <div className="flex flex-col w-full px-1">
            <Fade show={data?.user.loggedIn}>
                <Form navigate={false} className="flex flex-col gap-3 p-3 px-5" onSubmit={onSubmit}>
                    <div className="flex gap-3">
                        <UserAvatar avatar={data?.user.avatarPath} userName={data?.user.userName} className="flex-shrink-0 mt-[2px]" />
                        <PostEditor ref={ref}
                                    focus={setEditorActive}
                                    isActive={isEditorActive}
                                    placeholder="Write a post..."
                                    onTextUpdate={(progress: number) => setEditorProgress(progress)}
                                    editable={fetcher.state === 'idle'}
                                    editorProps={{ attributes: { class: 'break-all py-1 focus-visible:outline-none' } }}
                                    containerProps={{className: 'flex-grow w-full text-md'}}
                                    append={
                                        <motion.div className="self-end flex items-center overflow-y-hidden gap-3"
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}>
                                            <ProgressCircle percentage={editorProgress}/>
                                            <Button type="button" variant="ghost" onClick={handleCancel}>
                                                Cancel
                                            </Button>
                                            <Button className="font-bold" type="submit"
                                                    disabled={fetcher.state !== 'idle'}>
                                                {fetcher.state === 'idle' ? 'Post' : <LoadingSpinner/>}
                                            </Button>
                                        </motion.div>
                                    }
                        />
                    </div>
                </Form>
                <hr/>
            </Fade>
            <PostScroller posts={posts} user={data?.user} onLoad={onLoad} isLoading={isLoading} />
        </div>
    )
}