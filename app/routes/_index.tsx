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
import {FetchParams, useInfiniteScroll} from "@components/InfiniteScroll";
import usePostMutations from "@/utils/usePostMutations";

export async function loader({ context }: LoaderFunctionArgs) {
    return EndpointResponse({ user: context.user });
}

async function fetchPosts({ data, updateData, doUpdate, setHasMoreData }: FetchParams<PostWithRelations>) {
    const cursor = data && data.length ?
        data[data.length - 1].postedAt : new Date();
    const limit = 1;

    const params = new URLSearchParams();
    params.set('cursor', cursor.toString());
    params.set('limit', limit.toString());

    const response = await fetch('/posts/public?' + params);
    const json = await response.json();

    // setHasMoreData(json?.posts?.length === limit);
    setHasMoreData(false);

    if (doUpdate && json?.posts?.length) {
        updateData(json.posts);
    }
}

export default function Index() {
    const data = useLoaderData<typeof loader>();

    const [ editorProgress, setEditorProgress ] = useState<number>(0);
    const [ isEditorActive, setEditorActive ] = useState<boolean>(false);

    function sortFn(a: PostWithRelations, b: PostWithRelations) {
        if (a.postedAt > b.postedAt) {
            return -1;
        } else if (a.postedAt < b.postedAt) {
            return 1;
        }

        return 0;
    }

    const [ posts, setPosts, updatePosts, isLoading, onLoad ] = useInfiniteScroll<PostWithRelations>({
        fetchData: fetchPosts, sortFn
    });

    const {createPost} = usePostMutations({ setPosts, updatePosts, });

    const createFetcher = useFetcher();
    const ref = createRef<PostEditorElement>();

    useEffect(() => {
        if (createFetcher.state === 'idle' && createFetcher.data?.post) {
            createPost(createFetcher.data.post);
        }

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
                                    editable={ createFetcher.state === 'idle' }
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
                                                    disabled={createFetcher.state !== 'idle'}>
                                                {
                                                    createFetcher.state === 'idle' ? 'Post' : <LoadingSpinner/>
                                                }
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